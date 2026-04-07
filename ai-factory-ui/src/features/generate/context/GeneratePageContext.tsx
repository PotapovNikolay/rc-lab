'use client';

import { ReactNode, createContext, useContext } from 'react';
import { useGeneratePageController } from '@/features/generate/hooks/useGeneratePageController';

type GeneratePageContextValue = ReturnType<typeof useGeneratePageController>;

const GeneratePageContext = createContext<GeneratePageContextValue | null>(null);

type GeneratePageProviderProps = {
  children: ReactNode;
};

export function GeneratePageProvider({ children }: GeneratePageProviderProps) {
  const value = useGeneratePageController();
  return (
    <GeneratePageContext.Provider value={value}>
      {children}
    </GeneratePageContext.Provider>
  );
}

export function useGeneratePageContext(): GeneratePageContextValue {
  const context = useContext(GeneratePageContext);
  if (!context) {
    throw new Error('useGeneratePageContext must be used within GeneratePageProvider');
  }
  return context;
}
