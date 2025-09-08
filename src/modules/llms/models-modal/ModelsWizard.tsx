import * as React from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Avatar, Badge, Box, Button, Chip, CircularProgress, Input, Sheet, Typography } from '@mui/joy';

import { TooltipOutlined } from '~/common/components/TooltipOutlined';
import { llmsStoreActions, llmsStoreState, useModelsStore } from '~/common/stores/llms/store-llms';
import { useShallowStabilizer } from '~/common/util/hooks/useShallowObject';
import { useNodeChoice } from '~/common/stores/nodeChoice.store';

import type { IModelVendor } from '../vendors/IModelVendor';
import { LLMVendorIcon } from '../components/LLMVendorIcon';
import { ModelVendorAnthropic } from '../vendors/anthropic/anthropic.vendor';
import { ModelVendorLMStudio } from '../vendors/lmstudio/lmstudio.vendor';
import { ModelVendorLocalAI } from '../vendors/localai/localai.vendor';
import { ModelVendorOllama } from '../vendors/ollama/ollama.vendor';
import { ModelVendorOpenAI } from '../vendors/openai/openai.vendor';
import { ModelVendorOpenRouter } from '../vendors/openrouter/openrouter.vendor';
import { llmsUpdateModelsForServiceOrThrow } from '../llm.client';

// configuration
const AllWizardProviders: ReadonlyArray<WizardProvider> = [
  // Global/Popular providers
  { cat: 'popular', vendor: ModelVendorOpenAI, settingsKey: 'oaiKey' } as const,
  { cat: 'popular', vendor: ModelVendorAnthropic, settingsKey: 'anthropicKey' } as const,
  { cat: 'popular', vendor: ModelVendorOpenRouter, settingsKey: 'openrouterKey' } as const,
  // Local providers
  { cat: 'local', vendor: ModelVendorOllama, settingsKey: 'ollamaHost' } as const,
  { cat: 'local', vendor: ModelVendorLocalAI, settingsKey: 'localAIHost' } as const,
  { cat: 'local', vendor: ModelVendorLMStudio, settingsKey: 'oaiHost', omit: true } as const,
] as const;

type VendorCategory = 'popular' | 'local';

interface WizardProvider {
  cat: VendorCategory,
  vendor: IModelVendor<Record<string, any>, Record<string, any>>,
  settingsKey: string,
  omit?: boolean,
}

const _styles = {
  container: {
    margin: 'calc(-1 * var(--Card-padding, 1rem))',
    padding: 'var(--Card-padding)',
    display: 'grid',
    gap: 'calc(0.75 * var(--Card-padding))',
  } as const,

  text1: {
    my: 1,
    ml: 7.25,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  } as const,

  text1Mobile: {
    mb: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  } as const,

  text2: {
    my: 1,
    ml: 7.25,
    color: 'text.tertiary',
    fontSize: 'sm',
  } as const,

  text2Mobile: {
    mt: 2,
    color: 'text.tertiary',
    fontSize: 'sm',
  } as const,
} as const;

function WizardProviderSetup(props: {
  provider: WizardProvider,
  isFirst: boolean,
  isHidden: boolean,
}) {

  const { cat: providerCat, vendor: providerVendor, settingsKey: providerSettingsKey, omit: providerOmit } = props.provider;

  // state
  const [localValue, setLocalValue] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);

  // external state
  const stabilizeTransportAccess = useShallowStabilizer<Record<string, any>>();
  const { serviceKeyValue, serviceLLMsCount } = useModelsStore(useShallow(({ llms, sources }) => {

    // find the service | null
    const vendorService = sources.find(s => s.vId === providerVendor.id) ?? null;

    // (safe) service-derived properties
    const serviceLLMsCount = !vendorService ? null : llms.filter(llm => llm.sId === vendorService.id).length;
    const serviceAccess = stabilizeTransportAccess(providerVendor.getTransportAccess(vendorService?.setup));
    const serviceKeyValue = !serviceAccess ? null : vendorService?.setup[providerSettingsKey] ?? null;

    return {
      serviceKeyValue,
      serviceLLMsCount,
    };
  }));

  // [effect] initialize the local key
  const triggerValueLoad = localValue === null;
  React.useEffect(() => {
    if (triggerValueLoad)
      setLocalValue(serviceKeyValue || '');
  }, [serviceKeyValue, triggerValueLoad]);

  // derived
  const isLocal = providerCat === 'local';
  const valueName = isLocal ? 'server' : 'API Key';
  const { name: vendorName } = providerVendor;

  // handlers
  const handleTextChanged = React.useCallback((e: React.ChangeEvent) => {
    setLocalValue((e.target as HTMLInputElement).value);
  }, []);

  const handleSetServiceKeyValue = React.useCallback(async () => {

    // create the service if missing
    const { sources: llmsServices } = llmsStoreState();
    const { createModelsService, updateServiceSettings, setServiceLLMs } = llmsStoreActions();
    const vendorService = llmsServices.find(s => s.vId === providerVendor.id) || createModelsService(providerVendor);
    const vendorServiceId = vendorService.id;

    // set the key
    const newKey = localValue?.trim() ?? '';
    updateServiceSettings(vendorServiceId, { [providerSettingsKey]: newKey });

    // if the key is empty, remove the models
    if (!newKey) {
      setUpdateError(null);
      setServiceLLMs(vendorServiceId, [], false, false);
      return;
    }

    // update the models
    setUpdateError(null);
    setIsLoading(true);
    try {
      await llmsUpdateModelsForServiceOrThrow(vendorService.id, true);
    } catch (error: any) {
      let errorText = error.message || `An error occurred. Please check your ${valueName}.`;
      if (errorText.includes('Incorrect API key'))
        errorText = '[OpenAI issue] Unauthorized: Incorrect API key.';
      setUpdateError(errorText);
      setServiceLLMs(vendorServiceId, [], false, false);
    }
    setIsLoading(false);

  }, [localValue, providerSettingsKey, providerVendor, valueName]);

  // memoed components
  const endButtons = React.useMemo(() => ((localValue || '') === (serviceKeyValue || '')) ? null : (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant='solid' color='primary'
        onClick={handleSetServiceKeyValue}
      >
        {!serviceKeyValue ? 'Confirm' : !localValue?.trim() ? 'Clear' : 'Update'}
      </Button>
    </Box>
  ), [handleSetServiceKeyValue, localValue, serviceKeyValue]);

  // heuristics for warnings
  const isOnLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  return props.isHidden ? null : providerOmit ? (
    <Box sx={{ ..._styles.text1, my: 0, minHeight: '2.5rem' }}>
      {!isOnLocalhost && <Typography level='body-xs'>
        Please make sure the addresses can be reached from &quot;{typeof window !== 'undefined' ? window.location.hostname : 'this server'}&quot;. If you are using a local service, you may need to use a public URL.
      </Typography>}
    </Box>
  ) : (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

        {/* Left Icon */}
        <TooltipOutlined title={serviceLLMsCount ? `${serviceLLMsCount} ${vendorName} models available` : `${vendorName} API Key`} placement='top'>
          <Badge
            size='md' color='primary' variant='solid' badgeInset='12%'
            badgeContent={serviceLLMsCount} showZero={false}
            slotProps={{ badge: { sx: { boxShadow: 'xs', border: 'none' } } }}
          >
            <Avatar sx={{ height: '100%', aspectRatio: 1, backgroundColor: 'transparent' }}>
              {isLoading ? <CircularProgress color='primary' variant='solid' size='sm' /> : <LLMVendorIcon vendorId={providerVendor.id} />}
            </Avatar>
          </Badge>
        </TooltipOutlined>

        {/* Main key inputs */}
        <Box sx={{ flex: 1, display: 'grid' }}>
          <Input
            fullWidth
            name={`wizard-settings-value-${providerVendor.id}`}
            autoComplete='off'
            variant='outlined'
            value={localValue ?? ''}
            onChange={handleTextChanged}
            placeholder={`${vendorName} ${valueName}`}
            type={isLocal ? undefined : 'password'}
            endDecorator={endButtons}
          />
        </Box>

      </Box>

      {!isLoading && !updateError && !serviceLLMsCount && !!serviceKeyValue && (
        <Typography level='body-xs' color='warning' sx={{ ml: 7, px: 0.5 }}>No models found.</Typography>
      )}
      {!!updateError && <Typography level='body-xs' color='danger' sx={{ ml: 7, px: 0.5 }}>{updateError}</Typography>}

    </Box>
  );
}

export function ModelsWizard(props: {
  isMobile: boolean,
  onSkip?: () => void,
  onSwitchToAdvanced?: () => void,
}) {

  // external state
  const nodeChoice = useNodeChoice();

  // Filter providers based on node choice
  const WizardProviders = React.useMemo(() => {
    if (nodeChoice === 'own') {
      // Show only local providers
      return AllWizardProviders.filter(provider => provider.cat === 'local');
    } else if (nodeChoice === 'global') {
      // Show only popular/cloud providers
      return AllWizardProviders.filter(provider => provider.cat === 'popular');
    }
    // Fallback to all providers if nodeChoice is unset (shouldn't happen due to validation)
    return AllWizardProviders;
  }, [nodeChoice]);

  // derived
  const isLocal = nodeChoice === 'own';
  const sectionTitle = isLocal ? 'Local' : 'Popular';
  const sectionDescription = isLocal ? 'the addresses of' : 'your API keys for';

  return (
    <Sheet variant='soft' sx={_styles.container}>

      <Box sx={props.isMobile ? _styles.text1Mobile : _styles.text1}>
        <Typography component='div' level='title-sm'>
          Enter {sectionDescription}{' '}
          <Chip variant='solid' sx={{ mx: 0.25 }}>
            {sectionTitle}
          </Chip>
          {' '}AI services below.
        </Typography>
      </Box>
      
      {WizardProviders.map((provider, index) => (
        <WizardProviderSetup
          key={provider.vendor.id}
          provider={provider}
          isFirst={!index}
          isHidden={false} // No longer need to hide based on category since we filter the array
        />
      ))}

      <Box sx={props.isMobile ? _styles.text2Mobile : _styles.text2}>
        {!props.isMobile && <>
          Switch to{' '}
          <Box component='a' onClick={props.onSwitchToAdvanced} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>advanced configuration</Box>
          {' '}for more services,
        </>}{' '}
        or <Box component='a' onClick={props.onSkip} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>skip</Box> for now and do it later.
      </Box>

    </Sheet>
  );
}