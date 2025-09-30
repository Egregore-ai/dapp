import { apiAsync } from '~/common/util/trpc.client';

import type { IModelVendor } from '../IModelVendor';
import type { EgregoreAccessSchema } from '../../server/egregore/egregore.router';


interface DEgregoreServiceSettings {
  egregoreHost: string;
  egregoreJson: boolean;
}


export const ModelVendorEgregore: IModelVendor<DEgregoreServiceSettings, EgregoreAccessSchema> = {
  id: 'egregore',
  name: 'Egregore AI Runner',
  displayRank: 55,
  location: 'local',
  instanceLimit: 2,
  hasServerConfigKey: 'hasLlmEgregore',

  // functions
  getTransportAccess: (partialSetup): EgregoreAccessSchema => ({
    dialect: 'egregore',
    egregoreHost: partialSetup?.egregoreHost || '',
    egregoreJson: partialSetup?.egregoreJson || false,
  }),

  // List Models
  rpcUpdateModelsOrThrow: async (access) => await apiAsync.llmEgregore.listModels.query({ access }),

};