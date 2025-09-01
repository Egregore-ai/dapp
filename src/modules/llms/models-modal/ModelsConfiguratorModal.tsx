// src/modules/llms/models/ModelsConfiguratorModal.tsx
import * as React from 'react';

import { Box, Button, Divider } from '@mui/joy';

import type { DModelsService } from '~/common/stores/llms/llms.service.types';
import { AppBreadcrumbs } from '~/common/components/AppBreadcrumbs';
import { GoodModal } from '~/common/components/modals/GoodModal';
import { optimaActions } from '~/common/layout/optima/useOptima';
import { useHasLLMs } from '~/common/stores/llms/llms.hooks';
import { useIsMobile } from '~/common/components/useMatchMedia';

import { LLMVendorSetup } from '../components/LLMVendorSetup';
import { ModelsList } from './ModelsList';
import { ModelsServiceSelector } from './ModelsServiceSelector';
import { ModelsWizard } from './ModelsWizard';

// configuration
const MODELS_WIZARD_ENABLE_INITIALLY = true;

type TabValue = 'wizard' | 'setup' | 'defaults';

/**
 * Note: the reason for this component separation from the parent state, is delayed state initialization.
 */
export function ModelsConfiguratorModal(props: {
  modelsServices: DModelsService[],
  confServiceId: string | null,
  setConfServiceId: (serviceId: string | null) => void,
}) {

  const { modelsServices, confServiceId, setConfServiceId } = props;

  // state
  const [tab, setTab] = React.useState<TabValue>(
    MODELS_WIZARD_ENABLE_INITIALLY && !modelsServices.length ? 'wizard' : 'setup'
  );
  const showAllServices = false;

  // external state
  const isMobile = useIsMobile();
  const hasLLMs = useHasLLMs();

  // active service with fallback to the last added service
  const activeServiceId =
    confServiceId ?? modelsServices[modelsServices.length - 1]?.id ?? null;

  const activeService = modelsServices.find(s => s.id === activeServiceId);

  const hasAnyServices = !!modelsServices.length;
  const isTabWizard = tab === 'wizard';
  const isTabSetup = tab === 'setup';

  // [effect] Re-trigger easy mode when going back to 0 services
  const triggerWizard = !modelsServices.length;
  React.useEffect(() => {
    if (triggerWizard)
      setTab('wizard');
  }, [triggerWizard]);

  // handlers
  const handleShowAdvanced = React.useCallback(() => setTab('setup'), []);
  const handleShowWizard = React.useCallback(() => setTab('wizard'), []);

  // start button
  const startButton = React.useMemo(() => {
    if (isTabWizard)
      return (
        <Button
          variant='outlined'
          color='neutral'
          onClick={handleShowAdvanced}
          sx={{ backgroundColor: 'background.popup' }}
        >
          {isMobile ? 'More Services' : 'More Services'}
        </Button>
      );
    if (!hasAnyServices)
      return (
        <Button
          variant='outlined'
          color='neutral'
          onClick={handleShowWizard}
          sx={{ backgroundColor: 'background.popup' }}
        >
          {isMobile ? 'Quick Setup' : 'Quick Setup'}
        </Button>
      );
    return undefined;
  }, [handleShowAdvanced, handleShowWizard, hasAnyServices, isMobile, isTabWizard]);

  return (
    <GoodModal
      title={isTabWizard ? (
        <AppBreadcrumbs size='md' rootTitle='Welcome'>
          <AppBreadcrumbs.Leaf>Setup <b>AI Models</b></AppBreadcrumbs.Leaf>
        </AppBreadcrumbs>
      ) : (
        <AppBreadcrumbs size='md' rootTitle='Configure'>
          <AppBreadcrumbs.Leaf><b>AI Models</b></AppBreadcrumbs.Leaf>
        </AppBreadcrumbs>
      )}
      open
      onClose={optimaActions().closeModels}
      darkBottomClose={!isTabWizard}
      closeText={isTabWizard ? 'Done' : undefined}
      animateEnter={!hasLLMs}
      unfilterBackdrop
      startButton={startButton}
      autoOverflow={true}
    >

      {isTabWizard && <Divider />}
      {isTabWizard && (
        <ModelsWizard
          isMobile={isMobile}
          onSkip={optimaActions().closeModels}
          onSwitchToAdvanced={handleShowAdvanced}
        />
      )}

      {isTabSetup && (
        <>
          <ModelsServiceSelector
            modelsServices={modelsServices}
            selectedServiceId={activeServiceId}
            setSelectedServiceId={setConfServiceId}
          />
          <Divider sx={activeService ? undefined : { visibility: 'hidden' }} />
          <Box sx={{ display: 'grid', gap: 'var(--Card-padding)' }}>
            {activeService
              ? <LLMVendorSetup service={activeService} />
              : <Box sx={{ minHeight: '7.375rem' }} />
            }
          </Box>

          {hasLLMs && <Divider />}
          {hasLLMs && (
            <ModelsList
              filterServiceId={showAllServices ? null : activeServiceId}
              onOpenLLMOptions={optimaActions().openModelOptions}
              sx={{
                minHeight: '6rem',
                overflowY: 'auto',
                '--ListItem-paddingY': '0rem',
                '--ListItem-paddingRight': '0.5rem',
                backgroundColor: 'rgb(var(--joy-palette-neutral-lightChannel) / 20%)',
                borderRadius: 'md',
                '@media (max-width: 900px)': {
                  '--ListItem-paddingLeft': '0.5rem',
                  '--ListItem-paddingRight': '0.25rem',
                },
              }}
            />
          )}
        </>
      )}

      <Divider sx={{ visibility: 'hidden', height: 0 }} />
    </GoodModal>
  );
}
