'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GalleryFilters } from '@/features/gallery/components/Filters';
import { GalleryGroupsPanel } from '@/features/gallery/components/GroupsPanel';
import { GalleryImagesPanel } from '@/features/gallery/components/ImagesPanel';
import { GalleryLightbox } from '@/features/gallery/components/GalleryLightbox';
import { api } from '@/shared/api';
import { useDeleteImage, useOutputImages, useOutputList } from '@/shared/hooks';
import { getRuntimeSettings } from '@/shared/lib/runtimeConfig';
import { Job, OutputImage } from '@/core/types';
import { useWizardStore } from '@/stores/wizardStore';

type SelectedGroup = {
  style: string;
  character: string;
};

const EMPTY_GROUPS: Array<{
  style: string;
  character: string;
  count: number;
  latest: string;
}> = [];

const downloadImage = async (style: string, character: string, filename: string) => {
  const url = api.getImageUrl(style, character, filename, false);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getRuntimeSettings().apiToken}` },
  });

  if (!response.ok) throw new Error(`Download failed: ${response.status}`);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

function useGalleryPageView() {
  const router = useRouter();
  const loadJobToWizard = useWizardStore((state) => state.loadJobToWizard);
  const outputListQuery = useOutputList();
  const deleteImageMutation = useDeleteImage();

  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('all');
  const [activeGroup, setActiveGroup] = useState<SelectedGroup | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  const groups = outputListQuery.data?.groups ?? EMPTY_GROUPS;

  const styleOptions = useMemo(() => 
    Array.from(new Set(groups.map((group) => group.style))).sort(), 
  [groups]);

  const characterOptions = useMemo(() => {
    const filtered = selectedStyle === 'all'
      ? groups
      : groups.filter((group) => group.style === selectedStyle);
    return Array.from(new Set(filtered.map((group) => group.character))).sort();
  }, [groups, selectedStyle]);

  const filteredGroups = useMemo(() => 
    groups.filter((group) => {
      if (selectedStyle !== 'all' && group.style !== selectedStyle) return false;
      if (selectedCharacter !== 'all' && group.character !== selectedCharacter) return false;
      return true;
    }), 
  [groups, selectedCharacter, selectedStyle]);

  useEffect(() => {
    if (filteredGroups.length === 0) {
      setActiveGroup(null);
      return;
    }

    const stillExists = activeGroup
      ? filteredGroups.some(group => 
          group.style === activeGroup.style && group.character === activeGroup.character
        )
      : false;

    if (!stillExists) {
      setActiveGroup({
        style: filteredGroups[0].style,
        character: filteredGroups[0].character,
      });
    }
  }, [activeGroup, filteredGroups]);

  const imagesQuery = useOutputImages(activeGroup?.style, activeGroup?.character);
  const images = imagesQuery.data ?? [];
  const activeImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  const handleDelete = async (image: OutputImage) => {
    if (!activeGroup) return;
    try {
      await deleteImageMutation.mutateAsync({
        style: activeGroup.style,
        character: activeGroup.character,
        filename: image.filename,
      });
      await outputListQuery.refetch();
      await imagesQuery.refetch();
      setLightboxIndex(null);
      setActionError('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handleRepeatToWizard = () => {
    if (!activeImage?.metadata) {
      setActionError('Metadata is required to repeat this image in wizard');
      return;
    }
    const { components } = activeImage.metadata;
    loadJobToWizard({
      style: components.style,
      character: components.character,
      outfit: components.outfit,
      camera: components.camera,
      pose: components.pose,
      expression: components.expression,
      background: components.background,
    });
    setLightboxIndex(null);
    router.push('/generate');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <GalleryFilters
        model={{
          selectedStyle,
          selectedCharacter,
          styleOptions,
          characterOptions,
          imageCount: images.length,
          totalCount: outputListQuery.data?.total ?? 0,
          onStyleChange: setSelectedStyle,
          onCharacterChange: setSelectedCharacter,
        }}
      />

      <section className="flex-1 grid gap-6 lg:grid-cols-[300px_1fr] min-h-0">
        <GalleryGroupsPanel
          groups={filteredGroups}
          activeGroup={activeGroup}
          isLoading={outputListQuery.isLoading}
          onSelectGroup={setActiveGroup}
        />

        <GalleryImagesPanel
          activeGroup={activeGroup}
          isLoading={imagesQuery.isLoading}
          images={images}
          getThumbnailUrl={(filename) =>
            activeGroup ? api.getImageUrl(activeGroup.style, activeGroup.character, filename, true) : ''
          }
          onOpenImage={setLightboxIndex}
        />
      </section>

      <GalleryLightbox
        model={{
          activeGroup,
          activeImage,
          imagesLength: images.length,
          actionError,
          getImageUrl: (filename) =>
            activeGroup ? api.getImageUrl(activeGroup.style, activeGroup.character, filename, false) : '',
          onPrev: () => setLightboxIndex((prev) => (prev !== null ? Math.max(0, prev - 1) : prev)),
          onNext: () => setLightboxIndex((prev) => prev !== null ? Math.min(images.length - 1, prev + 1) : prev),
          onCopySeed: () => {
            if (!activeImage?.metadata) return;
            void navigator.clipboard.writeText(String(activeImage.metadata.seed));
          },
          onRepeatInWizard: handleRepeatToWizard,
          onDownload: () => {
            if (!activeGroup || !activeImage) return;
            void downloadImage(activeGroup.style, activeGroup.character, activeImage.filename);
          },
          onDelete: () => activeImage && handleDelete(activeImage),
          onClose: () => setLightboxIndex(null),
        }}
      />
    </div>
  );
}

export default function GalleryPage() {
  return useGalleryPageView();
}
