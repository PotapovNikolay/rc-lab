import {
  BaseModel,
  Character,
  ComponentType,
  GenerationStatusResponse,
  HealthResponse,
  OutputListResponse,
  OutputImage,
  OutputMetadata,
  QueueEstimate,
  QueueFile,
  SimpleComponent,
  Style,
} from '@/core/types';
import { getRuntimeSettings } from '@/shared/lib/runtimeConfig';

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { apiUrl, apiToken } = getRuntimeSettings();
    const url = `${apiUrl}${endpoint}`;

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (!endpoint.includes('/health') && apiToken) {
      headers.set('Authorization', `Bearer ${apiToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }));
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  async getHealth(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>('/api/health');
  }

  async getBaseModel(): Promise<BaseModel> {
    return this.fetch<BaseModel>('/api/library/base_model');
  }

  async updateBaseModel(data: BaseModel): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>('/api/library/base_model', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getComponents<T = any>(
    type: ComponentType
  ): Promise<Record<string, T>> {
    return this.fetch<Record<string, T>>(`/api/library/${type}`);
  }

  async getComponent<T = any>(
    type: ComponentType,
    id: string
  ): Promise<T> {
    return this.fetch<T>(`/api/library/${type}/${id}`);
  }

  async createComponent<T = any>(
    type: ComponentType,
    id: string,
    data: T
  ): Promise<{ success: boolean; id: string }> {
    return this.fetch<{ success: boolean; id: string }>(
      `/api/library/${type}`,
      {
        method: 'POST',
        body: JSON.stringify({ id, ...data }),
      }
    );
  }

  async updateComponent<T = any>(
    type: ComponentType,
    id: string,
    data: T
  ): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/api/library/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteComponent(
    type: ComponentType,
    id: string
  ): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/api/library/${type}/${id}`, {
      method: 'DELETE',
    });
  }

  async getQueue(): Promise<QueueFile> {
    return this.fetch<QueueFile>('/api/queue');
  }

  async saveQueue(queue: QueueFile): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>('/api/queue', {
      method: 'POST',
      body: JSON.stringify(queue),
    });
  }

  async getQueueEstimate(): Promise<QueueEstimate> {
    return this.fetch<QueueEstimate>('/api/queue/estimate');
  }

  async startGeneration(): Promise<{
    generation_id: string;
    status: string;
  }> {
    return this.fetch<{ generation_id: string; status: string }>(
      '/api/generate',
      {
        method: 'POST',
      }
    );
  }

  async getGenerationStatus(): Promise<GenerationStatusResponse> {
    return this.fetch<GenerationStatusResponse>('/api/generate/status');
  }

  async stopGeneration(): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>('/api/generate/stop', {
      method: 'POST',
    });
  }

  async getOutputList(): Promise<OutputListResponse> {
    return this.fetch<OutputListResponse>('/api/output');
  }

  async getOutputImages(
    style: string,
    character: string
  ): Promise<OutputImage[]> {
    return this.fetch<OutputImage[]>(`/api/output/${style}/${character}`);
  }

  async getLatestImages(
    limit: number = 8,
    outputListInput?: OutputListResponse
  ): Promise<Array<{
    style: string;
    character: string;
    filename: string;
  }>> {
    if (limit <= 0) {
      return [];
    }

    const outputList = outputListInput ?? await this.getOutputList();
    const results: Array<{
      style: string;
      character: string;
      filename: string;
      timestamp: number;
    }> = [];

    const parseTimestamp = (value?: string | null): number => {
      if (!value) return 0;
      const parsed = new Date(value).getTime();
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const sortedGroups = [...outputList.groups].sort(
      (a, b) => new Date(b.latest).getTime() - new Date(a.latest).getTime()
    );

    const maxGroupsToInspect = Math.min(sortedGroups.length, Math.max(limit * 2, limit));
    const groupsToInspect = sortedGroups.slice(0, maxGroupsToInspect);

    const imageCandidates = await Promise.all(
      groupsToInspect.map(async (group) => {
        try {
          const images = await this.getOutputImages(group.style, group.character);
          if (images.length === 0) {
            return null;
          }

          const fallbackTimestamp = parseTimestamp(group.latest);
          let bestFile = images[0].filename;
          let bestTimestamp =
            parseTimestamp(images[0].metadata?.generated) || fallbackTimestamp;

          for (const image of images.slice(1)) {
            const timestamp = parseTimestamp(image.metadata?.generated) || fallbackTimestamp;
            if (timestamp > bestTimestamp) {
              bestTimestamp = timestamp;
              bestFile = image.filename;
            }
          }

          return {
            style: group.style,
            character: group.character,
            filename: bestFile,
            timestamp: bestTimestamp,
          };
        } catch (error) {
          console.error(`Failed to fetch images for ${group.style}/${group.character}`, error);
          return null;
        }
      })
    );

    for (const candidate of imageCandidates) {
      if (candidate) {
        results.push(candidate);
      }
    }

    return results
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(({ style, character, filename }) => ({
        style,
        character,
        filename,
      }));
  }

  getImageUrl(
    style: string,
    character: string,
    filename: string,
    thumb: boolean = false
  ): string {
    const { apiUrl } = getRuntimeSettings();
    const url = `${apiUrl}/api/output/image/${style}/${character}/${filename}`;
    return thumb ? `${url}?thumb=1` : url;
  }

  async getImageMetadata(
    style: string,
    character: string,
    filename: string
  ): Promise<OutputMetadata> {
    return this.fetch<OutputMetadata>(
      `/api/output/meta/${style}/${character}/${filename}`
    );
  }

  async deleteImage(
    style: string,
    character: string,
    filename: string
  ): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(
      `/api/output/${style}/${character}/${filename}`,
      {
        method: 'DELETE',
      }
    );
  }
}

export const api = new ApiClient();
