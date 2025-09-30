import * as React from 'react';

import { Button, FormControl, Tooltip, Typography } from '@mui/joy';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

import type { DModelsServiceId } from '~/common/stores/llms/llms.service.types';
import { FormLabelStart } from '~/common/components/forms/FormLabelStart';
import { FormSwitchControl } from '~/common/components/forms/FormSwitchControl';
import { FormTextField } from '~/common/components/forms/FormTextField';
import { InlineError } from '~/common/components/InlineError';
import { Link } from '~/common/components/Link';
import { EgregoreIcon } from '~/common/components/icons/vendors/EgregoreIcon';
import { SetupFormRefetchButton } from '~/common/components/forms/SetupFormRefetchButton';
import { asValidURL } from '~/common/util/urlUtils';

import { useLlmUpdateModels } from '../../llm.client.hooks';
import { useServiceSetup } from '../useServiceSetup';

import { ModelVendorEgregore } from './egregore.vendor';
import { EgregoreAdministration } from './EgregoreAdministration';


export function EgregoreServiceSetup(props: { serviceId: DModelsServiceId }) {

  // state
  const [adminOpen, setAdminOpen] = React.useState(false);

  // external state
  const { service, serviceAccess, updateSettings } =
    useServiceSetup(props.serviceId, ModelVendorEgregore);

  // derived state
  const { egregoreHost, egregoreJson } = serviceAccess;

  const hostValid = !!asValidURL(egregoreHost);
  const hostError = !!egregoreHost && !hostValid;
  const shallFetchSucceed = !hostError;

  // fetch models
  const { isFetching, refetch, isError, error } =
    useLlmUpdateModels(false /* use button only (we don't have server-side conf) */, service);

  return <>

    <FormTextField
      autoCompleteId='egregore-host'
      title='Egregore AI Runner Host'
      placeholder='http://127.0.0.1:11434'
      isError={hostError}
      value={egregoreHost || ''}
      onChange={text => updateSettings({ egregoreHost: text })}
    />

    <FormControl orientation='horizontal'>
      <FormLabelStart title='Image Input' description='PNG only' />
      <Typography level='body-sm'>
        Egregore AI Runner supports PNG images (e.g. try Llama3.2-vision).
        For Image attachments, use the "Original" format option.
      </Typography>
    </FormControl>

    <FormSwitchControl
      title='JSON mode'
      on={<Typography level='title-sm' endDecorator={<WarningRoundedIcon sx={{ color: 'danger.solidBg' }} />}>Force JSON</Typography>}
      off='Off (default)'
      fullWidth
      description={
        <Tooltip arrow title='Models will output only JSON, including empty {} objects.'>
          <Link level='body-sm' href='https://github.com/jmorganca/ollama/blob/main/docs/api.md#generate-a-chat-completion' target='_blank'>Information</Link>
        </Tooltip>
      }
      checked={egregoreJson}
      onChange={on => {
        updateSettings({ egregoreJson: on });
        refetch();
      }}
    />

    <SetupFormRefetchButton
      refetch={refetch} disabled={!shallFetchSucceed || isFetching} loading={isFetching} error={isError}
      leftButton={
        <Button color='neutral' variant='solid' disabled={adminOpen} onClick={() => setAdminOpen(true)} startDecorator={<EgregoreIcon sx={{ fontSize:'lg' }}/>}>
          Egregore Admin
        </Button>
      }
    />

    {isError && <InlineError error={error} />}

    {adminOpen && <EgregoreAdministration access={serviceAccess} onClose={() => setAdminOpen(false)} />}

  </>;
}