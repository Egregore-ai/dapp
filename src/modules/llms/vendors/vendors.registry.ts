import { ModelVendorAnthropic } from './anthropic/anthropic.vendor';
import { ModelVendorDeepseek } from './deepseek/deepseekai.vendor';
import { ModelVendorEgregore } from './egregore/egregore.vendor';
import { ModelVendorLMStudio } from './lmstudio/lmstudio.vendor';
import { ModelVendorLocalAI } from './localai/localai.vendor';
import { ModelVendorOllama } from './ollama/ollama.vendor';
import { ModelVendorOpenAI } from './openai/openai.vendor';
import { ModelVendorOpenRouter } from './openrouter/openrouter.vendor';
import type { IModelVendor } from './IModelVendor';


export type ModelVendorId =
  | 'ollama'
  | 'egregore'
  | 'localai'
  | 'lmstudio'
  | 'anthropic'
  | 'deepseek'
  | 'openai'
  | 'openrouter'
  ;

/** Global: Vendor Instances Registry **/
const MODEL_VENDOR_REGISTRY: Record<ModelVendorId, IModelVendor> = {
  localai: ModelVendorLocalAI,
  anthropic: ModelVendorAnthropic,
  deepseek: ModelVendorDeepseek,
  egregore: ModelVendorEgregore,
  lmstudio: ModelVendorLMStudio,
  ollama: ModelVendorOllama,
  openai: ModelVendorOpenAI,
  openrouter: ModelVendorOpenRouter,
} as Record<string, IModelVendor>;


export function findAllModelVendors(): IModelVendor[] {
  const modelVendors = Object.values(MODEL_VENDOR_REGISTRY);
  modelVendors.sort((a, b) => a.displayRank - b.displayRank);
  return modelVendors;
}

export function findModelVendor<TServiceSettings extends object = {}, TAccess = unknown>(
  vendorId?: ModelVendorId,
): IModelVendor<TServiceSettings, TAccess> | null {
  return vendorId ? (MODEL_VENDOR_REGISTRY[vendorId] as IModelVendor<TServiceSettings, TAccess>) ?? null : null;
}

// export function getDefaultModelVendor(): IModelVendor {
//   return MODEL_VENDOR_REGISTRY.openai;
// }