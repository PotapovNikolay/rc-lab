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
} from './types';
import { getRuntimeSettings } from './runtimeConfig';

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { apiUrl, apiToken } = getRuntimeSettings();
    const url = `${apiUrl}${endpoint}`;

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    // Add authorization for all endpoints except /health
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

  // Health
  async getHealth(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>('/api/health');
  }

  // Library - Base Model
  async getBaseModel(): Promise<BaseModel> {
    return this.fetch<BaseModel>('/api/library/base_model');
  }

  async updateBaseModel(data: BaseModel): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>('/api/library/base_model', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Library - Components
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

  // Queue
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

  // Generation
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

  // Output
  async getOutputList(): Promise<OutputListResponse> {
    return this.fetch<OutputListResponse>('/api/output');
  }

  async getOutputImages(
    style: string,
    character: string
  ): Promise<OutputImage[]> {
    return this.fetch<OutputImage[]>(`/api/output/${style}/${character}`);
  }

  async getLatestImages(limit: number = 8): Promise<Array<{
    style: string;
    character: string;
    filename: string;
  }>> {
    // Получаем список всех групп
    const outputList = await this.getOutputList();
    const results: Array<{
      style: string;
      character: string;
      filename: string;
    }> = [];

    // Сортируем группы по дате (самые свежие первыми)
    const sortedGroups = [...outputList.groups].sort(
      (a, b) => new Date(b.latest).getTime() - new Date(a.latest).getTime()
    );

    // Собираем последние изображения из групп
    for (const group of sortedGroups) {
      if (results.length >= limit) break;

      try {
        const images = await this.getOutputImages(group.style, group.character);
        // Берём первое изображение из группы
        if (images.length > 0) {
          results.push({
            style: group.style,
            character: group.character,
            filename: images[0].filename,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch images for ${group.style}/${group.character}`, error);
      }
    }

    return results;
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
