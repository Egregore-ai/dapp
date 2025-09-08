'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NodeChoice = 'unset' | 'own' | 'global';

interface NodeConfig {
  key?: string;
}

interface NodeChoiceState {
  choice: NodeChoice;
  config: NodeConfig;
  lastUpdated?: number;
  setChoice: (choice: NodeChoice) => void;
  setConfig: (config: NodeConfig) => void;
  reset: () => void;
  toggle: () => void;
  isConfigured: () => boolean;
}

export const useNodeChoiceStore = create<NodeChoiceState>()(
  persist(
    (set, get) => ({
      choice: 'unset',
      config: {},
      lastUpdated: undefined,

      setChoice: (choice) => set({ choice, lastUpdated: Date.now() }),

      setConfig: (config) => set({ config, lastUpdated: Date.now() }),

      reset: () => set({ choice: 'unset', config: {}, lastUpdated: Date.now() }),

      toggle: () => {
        const current = get().choice;
        const next: NodeChoice = current === 'own' ? 'global' : 'own';
        set({ choice: next, lastUpdated: Date.now() });
      },

      isConfigured: () => {
        const state = get();
        return state.choice !== 'unset';
      },
    }),
    {
      name: 'dm.nodeChoice.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useNodeChoice = () => useNodeChoiceStore((state) => state.choice);
export const useNodeConfig = () => useNodeChoiceStore((state) => state.config);
export const useIsNodeConfigured = () => useNodeChoiceStore((state) => state.isConfigured());

export const nodeChoiceActions = {
  set: (choice: NodeChoice) => useNodeChoiceStore.getState().setChoice(choice),
  setConfig: (config: NodeConfig) => useNodeChoiceStore.getState().setConfig(config),
  reset: () => useNodeChoiceStore.getState().reset(),
  toggle: () => useNodeChoiceStore.getState().toggle(),
  isConfigured: () => useNodeChoiceStore.getState().isConfigured(),
};