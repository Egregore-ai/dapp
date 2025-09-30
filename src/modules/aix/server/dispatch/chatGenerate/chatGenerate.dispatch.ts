import { anthropicAccess } from '~/modules/llms/server/anthropic/anthropic.router';
import { egregoreAccess } from '~/modules/llms/server/egregore/egregore.router';
import { ollamaAccess } from '~/modules/llms/server/ollama/ollama.router';
import { openAIAccess } from '~/modules/llms/server/openai/openai.router';

import type { AixAPI_Access, AixAPI_Model, AixAPIChatGenerate_Request } from '../../api/aix.wiretypes';
import type { AixDemuxers } from '../stream.demuxers';


import { aixToAnthropicMessageCreate } from './adapters/anthropic.messageCreate';
import { aixToOpenAIChatCompletions } from './adapters/openai.chatCompletions';
import { aixToOpenAIResponses } from './adapters/openai.responsesCreate';

import type { IParticleTransmitter } from './IParticleTransmitter';
import { createAnthropicMessageParser, createAnthropicMessageParserNS } from './parsers/anthropic.parser';
import { createOpenAIChatCompletionsChunkParser, createOpenAIChatCompletionsParserNS } from './parsers/openai.parser';
import { createOpenAIResponsesEventParser, createOpenAIResponseParserNS, } from './parsers/openai.responses.parser';


/**
 * Interface for the vendor parsers to implement
 */
export type ChatGenerateParseFunction = (partTransmitter: IParticleTransmitter, eventData: string, eventName?: string) => void;


/**
 * Specializes to the correct vendor a request for chat generation
 */
export function createChatGenerateDispatch(access: AixAPI_Access, model: AixAPI_Model, chatGenerate: AixAPIChatGenerate_Request, streaming: boolean): {
  request: { url: string, headers: HeadersInit, body: object },
  demuxerFormat: AixDemuxers.StreamDemuxerFormat;
  chatGenerateParse: ChatGenerateParseFunction;
} {

  switch (access.dialect) {
    case 'anthropic':
      return {
        request: {
          ...anthropicAccess(access, model.id, '/v1/messages'),
          body: aixToAnthropicMessageCreate(model, chatGenerate, streaming),
        },
        demuxerFormat: streaming ? 'fast-sse' : null,
        chatGenerateParse: streaming ? createAnthropicMessageParser() : createAnthropicMessageParserNS(),
      };

    /**
     * Egregore has now an OpenAI compability layer for `chatGenerate` API, but still its own protocol for models listing.
     * - as such, we 'cast' here to the dispatch to an OpenAI dispatch, while using Egregore access
     * - we still use the egregore.router for the models listing and aministration APIs
     *
     * For reference we show the old code for body/demuxerFormat/chatGenerateParse also below
     */
    case 'egregore':
      return {
        request: {
          ...egregoreAccess(access, '/v1/chat/completions'), // use the OpenAI-compatible endpoint
          // body: egregoreChatCompletionPayload(model, _hist, access.egregoreJson, streaming),
          body: aixToOpenAIChatCompletions('openai', model, chatGenerate, access.egregoreJson, streaming),
        },
        // demuxerFormat: streaming ? 'json-nl' : null,
        demuxerFormat: streaming ? 'fast-sse' : null,
        // chatGenerateParse: createDispatchParserEgregore(),
        chatGenerateParse: streaming ? createOpenAIChatCompletionsChunkParser() : createOpenAIChatCompletionsParserNS(),
      };

    /**
     * Ollama has now an OpenAI compability layer for `chatGenerate` API, but still its own protocol for models listing.
     * - as such, we 'cast' here to the dispatch to an OpenAI dispatch, while using Ollama access
     * - we still use the ollama.router for the models listing and aministration APIs
     *
     * For reference we show the old code for body/demuxerFormat/chatGenerateParse also below
     */
    case 'ollama':
      return {
        request: {
          ...ollamaAccess(access, '/v1/chat/completions'), // use the OpenAI-compatible endpoint
          // body: ollamaChatCompletionPayload(model, _hist, access.ollamaJson, streaming),
          body: aixToOpenAIChatCompletions('openai', model, chatGenerate, access.ollamaJson, streaming),
        },
        // demuxerFormat: streaming ? 'json-nl' : null,
        demuxerFormat: streaming ? 'fast-sse' : null,
        // chatGenerateParse: createDispatchParserOllama(),
        chatGenerateParse: streaming ? createOpenAIChatCompletionsChunkParser() : createOpenAIChatCompletionsParserNS(),
      };

    case 'deepseek':
    case 'lmstudio':
    case 'localai':
    case 'openai':
    case 'openrouter':

      // switch to the Responses API if the model supports it
      const isResponsesAPI = !!model.vndOaiResponsesAPI;
      if (isResponsesAPI) {
        return {
          request: {
            ...openAIAccess(access, model.id, '/v1/responses'),
            body: aixToOpenAIResponses(model, chatGenerate, false, streaming),
          },
          demuxerFormat: streaming ? 'fast-sse' : null,
          chatGenerateParse: streaming ? createOpenAIResponsesEventParser() : createOpenAIResponseParserNS(),
        };
      }

      return {
        request: {
          ...openAIAccess(access, model.id, '/v1/chat/completions'),
          body: aixToOpenAIChatCompletions(access.dialect, model, chatGenerate, false, streaming),
        },
        demuxerFormat: streaming ? 'fast-sse' : null,
        chatGenerateParse: streaming ? createOpenAIChatCompletionsChunkParser() : createOpenAIChatCompletionsParserNS(),
      };
  }
}
