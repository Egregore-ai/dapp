import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

/*
 NOTE: this file is used IN THE FRONTEND - it's meant to be telling the frontend what the backend capabilities are.
 NOTE: this file is also used in the BACKEND for type safety of the returned payload.
 */

export interface BackendCapabilities {
  // llms
  hasLlmAnthropic: boolean;
  hasLlmDeepseek: boolean;
  hasLlmEgregore: boolean;
  hasLlmLocalAIHost: boolean;
  hasLlmLocalAIKey: boolean;
  hasLlmOllama: boolean;
  hasLlmOpenAI: boolean;
  hasLlmOpenRouter: boolean;
  // others
  hasDB: boolean;
  hasBrowsing: boolean;
  hasGoogleCustomSearch: boolean;
  hasVoiceElevenLabs: boolean;
  // hashes
  hashLlmReconfig: string;
  // build data
  build?: {
    gitSha?: string;
    pkgVersion?: string;
    timestamp?: string;
  };
}

interface BackendStore extends BackendCapabilities {
  _loadedCapabilities: boolean;
  setCapabilities: (capabilities: Partial<BackendCapabilities>) => void;
}

const useBackendCapabilitiesStore = create<BackendStore>()(
  (set) => ({

    // initial values
    hasLlmAnthropic: false,
    hasLlmDeepseek: false,
    hasLlmEgregore: false,
    hasLlmLocalAIHost: false,
    hasLlmLocalAIKey: false,
    hasLlmOllama: false,
    hasLlmOpenAI: false,
    hasLlmOpenRouter: false,
    hasDB: false,
    hasBrowsing: false,
    hasGoogleCustomSearch: false,
    hasVoiceElevenLabs: false,
    hashLlmReconfig: '',
    build: undefined,
    _loadedCapabilities: false,

    setCapabilities: (capabilities: Partial<BackendCapabilities>) =>
      set({
        ...capabilities,
        _loadedCapabilities: true,
      }),

  }),
);


export function useKnowledgeOfBackendCaps(): [boolean, (capabilities: Partial<BackendCapabilities>) => void] {
  return useBackendCapabilitiesStore(useShallow(state => [state._loadedCapabilities, state.setCapabilities]));
}

export function getBackendCapabilities(): BackendCapabilities {
  return useBackendCapabilitiesStore.getState();
}
