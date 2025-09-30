import * as React from 'react';

import { Badge, Box, Button, IconButton, ListItemDecorator, MenuItem, Option, Select, Tooltip, Typography } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import type { DModelsService, DModelsServiceId } from '~/common/stores/llms/llms.service.types';
import type { NodeChoice } from '~/common/stores/nodeChoice.store';
import { CloseablePopup } from '~/common/components/CloseablePopup';
import { ConfirmationModal } from '~/common/components/modals/ConfirmationModal';
import { TooltipOutlined } from '~/common/components/TooltipOutlined';
import { llmsStoreActions } from '~/common/stores/llms/store-llms';
import { themeZIndexOverMobileDrawer } from '~/common/app.theme';
import { useIsMobile } from '~/common/components/useMatchMedia';
import { useOverlayComponents } from '~/common/layout/overlays/useOverlayComponents';

import type { IModelVendor } from '../vendors/IModelVendor';
import { LLMVendorIcon } from '../components/LLMVendorIcon';
import { findAllModelVendors, findModelVendor } from '../vendors/vendors.registry';
import { vendorHasBackendCap } from '../vendors/vendor.helpers';

// configuration
const ENABLE_DELETE_LAST = true;

// Vendor filtering based on node choice
const LOCAL_VENDORS = ['ollama', 'egregore', 'localai', 'lmstudio'];
const GLOBAL_VENDORS = ['openai', 'anthropic', 'deepseek', 'openrouter'];

function vendorIcon(vendor: IModelVendor | null, greenMark: boolean) {
  const icon = !vendor?.id ? null : <LLMVendorIcon vendorId={vendor.id} />;
  return (greenMark && icon)
    ? <Badge size='sm' badgeContent='' slotProps={{ badge: { sx: { backgroundColor: 'lime', boxShadow: 'none', border: '1px solid gray', p: 0 } } }}>{icon}</Badge>
    : icon;
}

export function ModelsServiceSelector(props: {
  modelsServices: DModelsService[],
  selectedServiceId: DModelsServiceId | null,
  setSelectedServiceId: (serviceId: DModelsServiceId | null) => void,
  nodeChoice: NodeChoice,
  sectionTitle: string,
}) {

  // state
  const { showPromisedOverlay } = useOverlayComponents();
  const [vendorsMenuAnchor, setVendorsMenuAnchor] = React.useState<HTMLElement | null>(null);

  // external state
  const isMobile = useIsMobile();

  const handleShowVendors = (event: React.MouseEvent<HTMLElement>) => setVendorsMenuAnchor(event.currentTarget);

  const closeVendorsMenu = () => setVendorsMenuAnchor(null);

  // handlers
  const { modelsServices, setSelectedServiceId, nodeChoice } = props;

  const handleAddServiceForVendor = React.useCallback((vendor: IModelVendor) => {
    closeVendorsMenu();
    const modelsService = llmsStoreActions().createModelsService(vendor);
    setSelectedServiceId(modelsService.id);
  }, [setSelectedServiceId]);

  const enableDeleteButton = !!props.selectedServiceId && (ENABLE_DELETE_LAST || modelsServices.length > 1);

  const handleDeleteService = React.useCallback(async (serviceId: DModelsServiceId, skipConfirmation: boolean) => {
    if (skipConfirmation) {
      setSelectedServiceId(modelsServices.find(s => s.id !== serviceId)?.id ?? null);
      llmsStoreActions().removeService(serviceId);
      return;
    }
    showPromisedOverlay('llms-service-remove', {}, ({ onResolve, onUserReject }) =>
      <ConfirmationModal
        open onClose={onUserReject} onPositive={() => onResolve(true)}
        confirmationText='Are you sure you want to remove these models? The configuration data will be lost and you may have to enter it again.'
        positiveActionText='Remove'
      />,
    ).then(() => {
      setSelectedServiceId(modelsServices.find(s => s.id !== serviceId)?.id ?? null);
      llmsStoreActions().removeService(serviceId);
    }).catch(() => null);
  }, [modelsServices, setSelectedServiceId, showPromisedOverlay]);

  // vendor list items - filtered based on node choice
  const vendorComponents = React.useMemo(() => {
    // Filter vendors based on node choice
    const allowedVendors = nodeChoice === 'own' ? LOCAL_VENDORS : GLOBAL_VENDORS;
    
    const vendorItems = findAllModelVendors()
      .filter(v => v.instanceLimit !== 0)
      .filter(v => allowedVendors.includes(v.id)) // Filter based on node choice
      .sort((a, b) => {
        // Different sorting order for local vs global
        const order: Record<string, number> = nodeChoice === 'own'
          ? { ollama: 1, egregore: 2, localai: 3, lmstudio: 4 }
          : { openai: 1, anthropic: 2, deepseek: 3, openrouter: 4 };
        return (order[a.id] || 999) - (order[b.id] || 999);
      })
      .map(vendor => {
        const vendorInstancesCount = modelsServices.filter(s => s.vId === vendor.id).length;
        const enabled = (vendor.instanceLimit ?? 1) > vendorInstancesCount;
        return {
          vendor,
          enabled,
          component: (
            <MenuItem key={vendor.id} disabled={!enabled} onClick={() => handleAddServiceForVendor(vendor)}>
              <ListItemDecorator>
                {vendorIcon(vendor, vendorHasBackendCap(vendor))}
              </ListItemDecorator>
              {vendor.name}

              {/* Multiple instance hint */}
              {(vendor.instanceLimit ?? 1) > 1 && !!vendorInstancesCount && enabled && (
                <Typography component='span' level='body-sm'>
                  #{vendorInstancesCount + 1}
                </Typography>
              )}
            </MenuItem>
          ),
        };
      });

    return vendorItems.map(item => item.component);
  }, [handleAddServiceForVendor, modelsServices, nodeChoice]);

  // service items
  const serviceItems: { service: DModelsService, icon: React.ReactNode, component: React.ReactNode }[] = React.useMemo(() =>
      modelsServices.map(service => {
        const icon = vendorIcon(findModelVendor(service.vId), false);
        return {
          service,
          icon,
          component: (
            <Option key={service.id} value={service.id}>
              {service.label}
            </Option>
          ),
        };
      }).sort((a, b) => a.service.label.localeCompare(b.service.label))
    , [modelsServices]);

  const selectedServiceItem = serviceItems.find(item => item.service.id === props.selectedServiceId);
  const noServices = !serviceItems.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      
      {/* Section Header */}
      {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="title-md" sx={{ fontWeight: 600 }}>
          {props.sectionTitle}
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
          {nodeChoice === 'own' 
            ? 'Connect to your local AI services'
            : 'Connect to cloud-based AI providers'
          }
        </Typography>
      </Box> */}

      {/* Service Selector */}
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>

        {!isMobile && <Typography sx={{ mr: 1 }}>
          Service:
        </Typography>}

        <Select
          variant='outlined'
          value={props.selectedServiceId}
          disabled={noServices}
          onChange={(_event, value) => value && props.setSelectedServiceId(value)}
          startDecorator={selectedServiceItem?.icon}
          slotProps={{
            root: { sx: { minWidth: 180 } },
            indicator: { sx: { opacity: 0.5 } },
          }}
        >
          {serviceItems.map(item => item.component)}
        </Select>

        {(isMobile && !noServices) ? (
          <IconButton variant={noServices ? 'solid' : 'outlined'} color='primary' onClick={handleShowVendors} disabled={!!vendorsMenuAnchor} sx={{ borderColor: 'neutral.outlinedBorder' }}>
            <AddIcon />
          </IconButton>
        ) : (
          <Tooltip open={noServices && !vendorsMenuAnchor} variant='outlined' color='primary' size='md' placement={isMobile ? 'bottom-end' : 'top-start'} arrow title='Add your first AI service'>
            <Button variant={noServices ? 'solid' : 'outlined'} onClick={handleShowVendors} disabled={!!vendorsMenuAnchor} startDecorator={<AddIcon />} sx={{ borderColor: 'neutral.outlinedBorder' }}>
              Add
            </Button>
          </Tooltip>
        )}

        {enableDeleteButton && (
          <TooltipOutlined title={`Remove ${selectedServiceItem?.service.label || 'Service'}`}>
            <IconButton
              variant='plain' color='neutral' disabled={!enableDeleteButton} sx={{ ml: 'auto' }}
              onClick={(event) => props.selectedServiceId && handleDeleteService(props.selectedServiceId, event.shiftKey)}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </TooltipOutlined>
        )}

        {/* vendors popup, for adding */}
        <CloseablePopup
          menu anchorEl={vendorsMenuAnchor} onClose={closeVendorsMenu}
          minWidth={200}
          placement='auto-end'
          zIndex={themeZIndexOverMobileDrawer}
        >
          {vendorComponents.length > 0 ? vendorComponents : (
            <MenuItem disabled>
              <Typography level="body-sm" sx={{ color: 'text.tertiary', textAlign: 'center', py: 2 }}>
                {nodeChoice === 'own' 
                  ? 'No local services available. Please install Ollama, LocalAI, or LM Studio first.'
                  : 'No cloud services available.'
                }
              </Typography>
            </MenuItem>
          )}
        </CloseablePopup>

      </Box>
    </Box>
  );
}