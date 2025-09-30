import * as z from 'zod/v4';

import { createTRPCRouter, publicProcedure } from '~/server/trpc/trpc.server';
import { env } from '~/server/env';
import { fetchJsonOrTRPCThrow, fetchTextOrTRPCThrow } from '~/server/trpc/trpc.router.fetchers';

import { LLM_IF_OAI_Chat, LLM_IF_OAI_Fn, LLM_IF_OAI_Vision } from '~/common/stores/llms/llms.types';
import { capitalizeFirstLetter } from '~/common/util/textUtils';

import { ListModelsResponse_schema } from '../llm.server.types';

import { EGREGORE_BASE_MODELS, EGREGORE_PREV_UPDATE } from './egregore.models';
import { wireEgregoreListModelsSchema, wireEgregoreModelInfoSchema } from './egregore.wiretypes';
import { fixupHost } from '~/modules/llms/server/openai/openai.router';


// Default hosts
const DEFAULT_EGREGORE_HOST = 'http://127.0.0.1:11434';
// export const EGREGORE_PATH_CHAT = '/api/chat';
const EGREGORE_PATH_TAGS = '/api/tags';
const EGREGORE_PATH_SHOW = '/api/show';


// Mappers

export function egregoreAccess(access: EgregoreAccessSchema, apiPath: string): { headers: HeadersInit, url: string } {

  const egregoreHost = fixupHost(access.egregoreHost || env.EGREGORE_API_HOST || DEFAULT_EGREGORE_HOST, apiPath);

  return {
    headers: {
      'Content-Type': 'application/json',
    },
    url: egregoreHost + apiPath,
  };

}


/*export const egregoreChatCompletionPayload = (model: OpenAIModelSchema, history: OpenAIHistorySchema, jsonOutput: boolean, stream: boolean): WireEgregoreChatCompletionInput => ({
  model: model.id,
  messages: history,
  options: {
    ...(model.temperature !== undefined && { temperature: model.temperature }),
  },
  ...(jsonOutput && { format: 'json' }),
  // n: ...
  // functions: ...
  // function_call: ...
  stream,
});*/


/* Unused: switched to the Chat endpoint (above). The implementation is left here for reference.
https://github.com/jmorganca/ollama/blob/main/docs/api.md#generate-a-completion
export function egregoreCompletionPayload(model: OpenAIModelSchema, history: OpenAIHistorySchema, stream: boolean) {

  // if the first message is the system prompt, extract it
  let systemPrompt: string | undefined = undefined;
  if (history.length && history[0].role === 'system') {
    const [firstMessage, ...rest] = history;
    systemPrompt = firstMessage.content;
    history = rest;
  }

  // encode the prompt for egregore, assuming the same template for everyone for now
  const prompt = history.map(({ role, content }) => {
    return role === 'assistant' ? `\n\nAssistant: ${content}` : `\n\nHuman: ${content}`;
  }).join('') + '\n\nAssistant:\n';

  // const prompt = history.map(({ role, content }) => {
  //   return role === 'assistant' ? `### Response:\n${content}\n\n` : `### User:\n${content}\n\n`;
  // }).join('') + '### Response:\n';

  return {
    model: model.id,
    prompt,
    options: {
      ...(model.temperature !== undefined && { temperature: model.temperature }),
    },
    ...(systemPrompt && { system: systemPrompt }),
    stream,
  };
}*/

async function egregoreGET<TOut extends object>(access: EgregoreAccessSchema, apiPath: string /*, signal?: AbortSignal*/): Promise<TOut> {
  const { headers, url } = egregoreAccess(access, apiPath);
  return await fetchJsonOrTRPCThrow<TOut>({ url, headers, name: 'Egregore' });
}

async function egregorePOST<TOut extends object, TPostBody extends object>(access: EgregoreAccessSchema, body: TPostBody, apiPath: string /*, signal?: AbortSignal*/): Promise<TOut> {
  const { headers, url } = egregoreAccess(access, apiPath);
  return await fetchJsonOrTRPCThrow<TOut, TPostBody>({ url, method: 'POST', headers, body, name: 'Egregore' });
}


// Input/Output Schemas

export const egregoreAccessSchema = z.object({
  dialect: z.enum(['egregore']),
  egregoreHost: z.string().trim(),
  egregoreJson: z.boolean(),
});
export type EgregoreAccessSchema = z.infer<typeof egregoreAccessSchema>;

const accessOnlySchema = z.object({
  access: egregoreAccessSchema,
});

const adminPullModelSchema = z.object({
  access: egregoreAccessSchema,
  name: z.string(),
});

// this may not be needed
const listPullableOutputSchema = z.object({
  pullableModels: z.array(z.object({
    id: z.string(),
    label: z.string(),
    tag: z.string(),
    tags: z.array(z.string()),
    description: z.string(),
    pulls: z.number(),
    isNew: z.boolean(),
  })),
});


export const llmEgregoreRouter = createTRPCRouter({

  /* Egregore: models that can be pulled */
  adminListPullable: publicProcedure
    .input(accessOnlySchema)
    .output(listPullableOutputSchema)
    .query(async ({}) => {
      return {
        pullableModels: Object.entries(EGREGORE_BASE_MODELS).map(([model_id, model]) => ({
          id: model_id,
          label: capitalizeFirstLetter(model_id),
          tag: 'latest',
          tags: model.tags?.length ? model.tags : [],
          description: model.description,
          pulls: model.pulls,
          isNew: !!model.added && model.added > EGREGORE_PREV_UPDATE,
        })),
      };
    }),

  /* Egregore: pull a model */
  adminPull: publicProcedure
    .input(adminPullModelSchema)
    .mutation(async ({ input }) => {

      // fetch as a large text buffer, made of JSONs separated by newlines
      const { headers, url } = egregoreAccess(input.access, '/api/pull');
      const pullRequest = await fetchTextOrTRPCThrow({ url, method: 'POST', headers, body: { 'name': input.name }, name: 'Egregore::pull' });

      // accumulate status and error messages
      let lastStatus: string = 'unknown';
      let lastError: string | undefined = undefined;
      for (let string of pullRequest.trim().split('\n')) {
        const message = JSON.parse(string);
        if (message.status)
          lastStatus = input.name + ': ' + message.status;
        if (message.error)
          lastError = message.error;
      }

      return { status: lastStatus, error: lastError };
    }),

  /* Egregore: delete a model */
  adminDelete: publicProcedure
    .input(adminPullModelSchema)
    .mutation(async ({ input }) => {
      const { headers, url } = egregoreAccess(input.access, '/api/delete');
      const deleteOutput = await fetchTextOrTRPCThrow({ url, method: 'DELETE', headers, body: { 'name': input.name }, name: 'Egregore::delete' });
      if (deleteOutput?.length && deleteOutput !== 'null')
        throw new Error('Egregore delete issue: ' + deleteOutput);
    }),


  /* Egregore: List the Models available */
  listModels: publicProcedure
    .input(accessOnlySchema)
    .output(ListModelsResponse_schema)
    .query(async ({ input }) => {

      // get the models
      const wireModels = await egregoreGET(input.access, EGREGORE_PATH_TAGS);
      let models = wireEgregoreListModelsSchema.parse(wireModels).models;

      // retrieve info for each of the models (/api/show, post call, in parallel)
      const detailedModels = await Promise.all(models.map(async model => {
        const wireModelInfo = await egregorePOST(input.access, { 'name': model.name }, EGREGORE_PATH_SHOW);
        const modelInfo = wireEgregoreModelInfoSchema.parse(wireModelInfo);
        return { ...model, ...modelInfo };
      }));

      return {
        models: detailedModels.map(model => {
          // the model name is in the format "name:tag" (default tag = 'latest')
          const [modelName, modelTag] = model.name.split(':');

          // pretty label and description
          const label = capitalizeFirstLetter(modelName) + ((modelTag && modelTag !== 'latest') ? ` (${modelTag})` : '');
          const baseModel = EGREGORE_BASE_MODELS[modelName] ?? {};
          let description = baseModel.description || 'Model unknown';

          // prepend the parameters count and quantization level
          if (model.details?.quantization_level || model.details?.format || model.details?.parameter_size) {
            let firstLine = model.details.parameter_size ? `${model.details.parameter_size} parameters ` : '';
            if (model.details.quantization_level)
              firstLine += `(${model.details.quantization_level}` + ((model.details.format) ? `, ${model.details.format})` : ')');
            if (model.size)
              firstLine += `, ${(model.size / 1024 / 1024 / 1024).toFixed(1)} GB`;
            if (baseModel.hasTools)
              firstLine += ' [tools]';
            if (baseModel.hasVision)
              firstLine += ' [vision]';
            description = firstLine + '\n\n' + description;
          }


          let contextWindow = baseModel.contextWindow || 8192;
          if (model.parameters) {
            // split the parameters into lines, and find one called "num_ctx ...spaces... number"
            const paramsNumCtx = model.parameters.split('\n').find(line => line.startsWith('num_ctx '));
            if (paramsNumCtx) {
              const numCtxValue: string = paramsNumCtx.split(/\s+/)[1];
              if (numCtxValue) {
                const numCtxNumber: number = parseInt(numCtxValue);
                if (!isNaN(numCtxNumber))
                  contextWindow = numCtxNumber;
              }
            }
          }

          // auto-detect interfaces from the hardcoded description (in turn parsed from the html page)
          const interfaces = !baseModel.isEmbeddings ? [LLM_IF_OAI_Chat] : [];
          if (baseModel.hasTools)
            interfaces.push(LLM_IF_OAI_Fn);
          if (baseModel.hasVision || modelName.includes('-vision')) // Heuristic
            interfaces.push(LLM_IF_OAI_Vision);

          // console.log('>>> egregore model', model.name, model.template, model.modelfile, '\n');

          return {
            id: model.name,
            label,
            created: Date.parse(model.modified_at) ?? undefined,
            updated: Date.parse(model.modified_at) ?? undefined,
            description: description, // description: (model.license ? `License: ${model.license}. Info: ` : '') + model.modelfile || 'Model unknown',
            contextWindow,
            ...(contextWindow ? { maxCompletionTokens: Math.round(contextWindow / 2) } : {}),
            interfaces,
          };
        }),
      };
    }),

});