import * as React from 'react';

import type { DModelsService, DModelsServiceId } from '~/common/stores/llms/llms.service.types';

import { findModelVendor, ModelVendorId } from '../vendors/vendors.registry';


// direct imports for all vendor setup components - NOTE: we could lazy load if this becomes a performance issue
import { AnthropicServiceSetup } from '../vendors/anthropic/AnthropicServiceSetup';
import { DeepseekAIServiceSetup } from '../vendors/deepseek/DeepseekAIServiceSetup';
import { EgregoreServiceSetup } from '../vendors/egregore/EgregoreServiceSetup';
import { LMStudioServiceSetup } from '../vendors/lmstudio/LMStudioServiceSetup';
import { LocalAIServiceSetup } from '../vendors/localai/LocalAIServiceSetup';
import { OllamaServiceSetup } from '../vendors/ollama/OllamaServiceSetup';
import { OpenAIServiceSetup } from '../vendors/openai/OpenAIServiceSetup';
import { OpenRouterServiceSetup } from '../vendors/openrouter/OpenRouterServiceSetup';


/**
 * Add to this map to register a new Vendor Setup Component.
 * NOTE: we do it here to only depend on this file (even lazily) and avoid to import all the Components (UI)
 *       code on vendor definitions (which must be lightweight as it impacts boot time).
 */
const vendorSetupComponents: Record<ModelVendorId, React.ComponentType<{ serviceId: DModelsServiceId }>> = {
  ollama: OllamaServiceSetup,
  egregore: EgregoreServiceSetup,
  anthropic: AnthropicServiceSetup,
  deepseek: DeepseekAIServiceSetup,
  lmstudio: LMStudioServiceSetup,
  localai: LocalAIServiceSetup,
  openai: OpenAIServiceSetup,
  openrouter: OpenRouterServiceSetup,
} as const;


export function LLMVendorSetup(props: { service: DModelsService }) {
  const vendor = findModelVendor(props.service.vId);
  if (!vendor)
    return 'Configuration issue: Vendor not found for Service ' + props.service.id;

  const SetupComponent = vendorSetupComponents[vendor.id];
  if (!SetupComponent)
    return 'Configuration issue: Setup component not found for vendor ' + vendor.id;

  return <SetupComponent key={props.service.id} serviceId={props.service.id} />;
}
