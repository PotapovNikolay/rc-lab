import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import WebSocket from 'ws';
import { config } from '../config';
import {
  ComfyUIWorkflow,
  ComfyUIPromptRequest,
  ComfyUIPromptResponse,
  ComfyUIHistory,
  ComfyUIHistoryItem,
  ComfyUISystemStats,
  ComfyUIQueueInfo,
} from '../types';

// WebSocket event types
export interface ComfyProgressEvent {
  type: 'progress';
  data: {
    value: number;
    max: number;
  };
}

export interface ComfyExecutingEvent {
  type: 'executing';
  data: {
    node: string | null;
    prompt_id: string;
  };
}

export interface ComfyExecutedEvent {
  type: 'executed';
  data: {
    node: string;
    output: any;
    prompt_id: string;
  };
}

export type ComfyWSEvent = ComfyProgressEvent | ComfyExecutingEvent | ComfyExecutedEvent;

export type ProgressCallback = (event: ComfyWSEvent) => void;

export class ComfyService {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private wsConnected: boolean = false;
  private progressCallbacks: Map<string, ProgressCallback> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.baseUrl = config.comfyApi;
    // Convert http://127.0.0.1:8188 to ws://127.0.0.1:8188/ws
    this.wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';
  }

  /**
   * Check ComfyUI health
   */
  async checkHealth(): Promise<{ available: boolean; memory?: { free: number; total: number } }> {
    try {
      const response = await fetch(`${this.baseUrl}/system_stats`, {
        method: 'GET',
        timeout: 5000,
      });

      if (!response.ok) {
        return { available: false };
      }

      const stats = (await response.json()) as ComfyUISystemStats;

      // Calculate total VRAM if GPU available
      const memory = stats.devices?.[0]
        ? {
            free: Math.round(stats.devices[0].vram_free),
            total: Math.round(stats.devices[0].vram_total),
          }
        : {
            free: Math.round(stats.system.ram_free),
            total: Math.round(stats.system.ram_total),
          };

      return {
        available: true,
        memory,
      };
    } catch (error) {
      return { available: false };
    }
  }

  /**
   * Get current queue info
   */
  async getQueue(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/queue`, {
        method: 'GET',
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error('Failed to get queue');
      }

      const data = (await response.json()) as ComfyUIQueueInfo;
      return data.queue_running.length + data.queue_pending.length;
    } catch (error) {
      throw new Error(`Failed to get queue: ${(error as Error).message}`);
    }
  }

  /**
   * Clear queue
   */
  async clearQueue(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear: true }),
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error('Failed to clear queue');
      }
    } catch (error) {
      throw new Error(`Failed to clear queue: ${(error as Error).message}`);
    }
  }

  /**
   * Free memory
   */
  async freeMemory(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unload_models: false,
          free_memory: true,
        }),
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error('Failed to free memory');
      }
    } catch (error) {
      console.warn(`Failed to free memory: ${(error as Error).message}`);
    }
  }

  /**
   * Submit a prompt to ComfyUI
   */
  async submitPrompt(workflow: ComfyUIWorkflow): Promise<string> {
    try {
      const request: ComfyUIPromptRequest = {
        prompt: workflow,
      };

      const response = await fetch(`${this.baseUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        timeout: 10000,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ComfyUI returned ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as ComfyUIPromptResponse;

      if (data.node_errors && Object.keys(data.node_errors).length > 0) {
        throw new Error(`ComfyUI workflow errors: ${JSON.stringify(data.node_errors)}`);
      }

      return data.prompt_id;
    } catch (error) {
      throw new Error(`Failed to submit prompt: ${(error as Error).message}`);
    }
  }

  /**
   * Get history for a specific prompt
   */
  async getHistory(promptId: string): Promise<ComfyUIHistoryItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${promptId}`, {
        method: 'GET',
        timeout: 5000,
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as ComfyUIHistory;
      return data[promptId] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Wait for prompt completion with WebSocket + polling fallback
   */
  async waitForCompletion(
    promptId: string,
    timeoutMs: number = 300000,
    onProgress?: ProgressCallback
  ): Promise<ComfyUIHistoryItem> {
    const startTime = Date.now();
    const pollInterval = 3000; // 3 seconds

    // Use WebSocket if connected
    if (this.wsConnected && onProgress) {
      this.onProgress(promptId, onProgress);
    }

    return new Promise((resolve, reject) => {
      const checkCompletion = async () => {
        try {
          // Check timeout
          if (Date.now() - startTime >= timeoutMs) {
            this.offProgress(promptId);
            reject(new Error(`Timeout waiting for prompt ${promptId} to complete`));
            return;
          }

          const history = await this.getHistory(promptId);

          if (history) {
            // Check if completed
            if (history.status.completed) {
              this.offProgress(promptId);
              resolve(history);
              return;
            }

            // Check for errors
            if (history.status.status_str === 'error') {
              this.offProgress(promptId);
              const errorMessages = history.status.messages?.map(m => m.join(': ')).join(', ') || 'Unknown error';
              reject(new Error(`ComfyUI execution error: ${errorMessages}`));
              return;
            }
          }

          // Continue polling
          setTimeout(checkCompletion, pollInterval);
        } catch (error) {
          this.offProgress(promptId);
          reject(error);
        }
      };

      // Start polling
      checkCompletion();
    });
  }

  /**
   * Get output image from ComfyUI
   */
  async getOutputImage(subfolder: string, filename: string): Promise<Buffer> {
    const fullPath = path.join(config.comfyOutput, subfolder, filename);

    try {
      const buffer = await fs.readFile(fullPath);
      return buffer;
    } catch (error) {
      throw new Error(`Failed to read output image: ${(error as Error).message}`);
    }
  }

  /**
   * Extract output filename from history
   */
  extractOutputFilename(history: ComfyUIHistoryItem): { filename: string; subfolder: string } | null {
    // Find the output node (usually SaveImage node)
    for (const [nodeId, output] of Object.entries(history.outputs)) {
      if (output.images && output.images.length > 0) {
        const image = output.images[0];
        return {
          filename: image.filename,
          subfolder: image.subfolder || '',
        };
      }
    }
    return null;
  }

  /**
   * Interrupt current execution
   */
  async interrupt(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/interrupt`, {
        method: 'POST',
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error('Failed to interrupt');
      }
    } catch (error) {
      throw new Error(`Failed to interrupt: ${(error as Error).message}`);
    }
  }

  /**
   * Connect to ComfyUI WebSocket
   */
  connectWebSocket(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return; // Already connected or connecting
    }

    console.log(`🔌 Connecting to ComfyUI WebSocket: ${this.wsUrl}`);

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.on('open', () => {
        console.log('✅ ComfyUI WebSocket connected');
        this.wsConnected = true;
        this.reconnectAttempts = 0;

        // Clear reconnect timeout if any
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('❌ ComfyUI WebSocket error:', error.message);
      });

      this.ws.on('close', () => {
        console.log('🔌 ComfyUI WebSocket disconnected');
        this.wsConnected = false;
        this.attemptReconnect();
      });
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.wsConnected = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`⚠️ Max WebSocket reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000); // Exponential backoff, max 30s

    console.log(`🔄 Attempting WebSocket reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  /**
   * Handle WebSocket message
   */
  private handleWebSocketMessage(message: any): void {
    const { type, data } = message;

    // Forward to all registered callbacks
    this.progressCallbacks.forEach(callback => {
      callback({ type, data });
    });
  }

  /**
   * Register a progress callback for a specific prompt ID
   */
  onProgress(promptId: string, callback: ProgressCallback): void {
    this.progressCallbacks.set(promptId, callback);
  }

  /**
   * Unregister a progress callback
   */
  offProgress(promptId: string): void {
    this.progressCallbacks.delete(promptId);
  }

  /**
   * Check if WebSocket is connected
   */
  isWebSocketConnected(): boolean {
    return this.wsConnected;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const comfyService = new ComfyService();

// Auto-connect WebSocket on service initialization
comfyService.connectWebSocket();
