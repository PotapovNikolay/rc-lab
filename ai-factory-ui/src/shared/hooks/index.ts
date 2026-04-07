'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { BaseModel, ComponentType, OutputListResponse, QueueFile } from '@/core/types';

const queryKeys = {
  health: ['health'] as const,
  baseModel: ['library', 'base_model'] as const,
  library: (type: ComponentType) => ['library', type] as const,
  libraryItem: (type: ComponentType, id: string) =>
    ['library', type, id] as const,
  queue: ['queue'] as const,
  queueEstimate: ['queue', 'estimate'] as const,
  generationStatus: ['generation', 'status'] as const,
  outputList: ['output'] as const,
  outputImages: (style: string, character: string) =>
    ['output', style, character] as const,
  outputMeta: (style: string, character: string, filename: string) =>
    ['output', style, character, filename] as const,
  latestImages: (limit: number) => ['output', 'latest', limit] as const,
};

type CreateItemInput<T> = {
  id: string;
  data: T;
};

type UpdateItemInput<T> = {
  id: string;
  data: T;
};

type DeleteImageInput = {
  style: string;
  character: string;
  filename: string;
};

type QueryBehaviorOptions = {
  enabled?: boolean;
  staleTime?: number;
};

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.getHealth(),
    refetchInterval: 30_000,
  });
}

export function useBaseModel() {
  return useQuery({
    queryKey: queryKeys.baseModel,
    queryFn: () => api.getBaseModel(),
  });
}

export function useLibrary<T = unknown>(
  type: ComponentType,
  options: QueryBehaviorOptions = {}
) {
  return useQuery({
    queryKey: queryKeys.library(type),
    queryFn: () => api.getComponents<T>(type),
    enabled: options.enabled,
    staleTime: options.staleTime,
  });
}

export function useLibraryItem<T = unknown>(type: ComponentType, id?: string) {
  return useQuery({
    queryKey: queryKeys.libraryItem(type, id ?? ''),
    queryFn: () => api.getComponent<T>(type, id as string),
    enabled: Boolean(id),
  });
}

export function useQueue() {
  return useQuery({
    queryKey: queryKeys.queue,
    queryFn: () => api.getQueue(),
  });
}

export function useQueueEstimate() {
  return useQuery({
    queryKey: queryKeys.queueEstimate,
    queryFn: () => api.getQueueEstimate(),
  });
}

export function useGenerationStatus() {
  return useQuery({
    queryKey: queryKeys.generationStatus,
    queryFn: () => api.getGenerationStatus(),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'running' || status === 'stopping' ? 3_000 : 10_000;
    },
    refetchIntervalInBackground: true,
  });
}

export function useOutputList() {
  return useQuery({
    queryKey: queryKeys.outputList,
    queryFn: () => api.getOutputList(),
  });
}

export function useOutputImages(style?: string, character?: string) {
  return useQuery({
    queryKey: queryKeys.outputImages(style ?? '', character ?? ''),
    queryFn: () => api.getOutputImages(style as string, character as string),
    enabled: Boolean(style && character),
  });
}

export function useOutputMetadata(
  style?: string,
  character?: string,
  filename?: string
) {
  return useQuery({
    queryKey: queryKeys.outputMeta(style ?? '', character ?? '', filename ?? ''),
    queryFn: () =>
      api.getImageMetadata(style as string, character as string, filename as string),
    enabled: Boolean(style && character && filename),
  });
}

export function useLatestImages(
  limit: number = 8,
  options: QueryBehaviorOptions = {}
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.latestImages(limit),
    queryFn: () => {
      const cachedOutputList = queryClient.getQueryData<OutputListResponse>(
        queryKeys.outputList
      );
      return api.getLatestImages(limit, cachedOutputList);
    },
    enabled: options.enabled,
    staleTime: options.staleTime,
  });
}

export function useUpdateBaseModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BaseModel) => api.updateBaseModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baseModel });
    },
  });
}

export function useCreateItem<T = unknown>(type: ComponentType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateItemInput<T>) =>
      api.createComponent<T>(type, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library(type) });
    },
  });
}

export function useUpdateItem<T = unknown>(type: ComponentType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateItemInput<T>) =>
      api.updateComponent<T>(type, payload.id, payload.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library(type) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.libraryItem(type, variables.id),
      });
    },
  });
}

export function useDeleteItem(type: ComponentType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteComponent(type, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library(type) });
      queryClient.removeQueries({ queryKey: queryKeys.libraryItem(type, id) });
    },
  });
}

export function useSaveQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queue: QueueFile) => api.saveQueue(queue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.queue });
      queryClient.invalidateQueries({ queryKey: queryKeys.queueEstimate });
    },
  });
}

export function useStartGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.startGeneration(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generationStatus });
    },
  });
}

export function useStopGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.stopGeneration(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generationStatus });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteImageInput) =>
      api.deleteImage(payload.style, payload.character, payload.filename),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outputList });
      queryClient.invalidateQueries({
        queryKey: queryKeys.outputImages(variables.style, variables.character),
      });
    },
  });
}
