import * as React from 'react';

import { Autocomplete, Box, Button, Chip, FormControl, IconButton, Option, Select, Typography } from '@mui/joy';
import LaunchIcon from '@mui/icons-material/Launch';
import FormatListNumberedRtlIcon from '@mui/icons-material/FormatListNumberedRtl';

import { FormLabelStart } from '~/common/components/forms/FormLabelStart';
import { GoodModal } from '~/common/components/modals/GoodModal';
import { apiAsync } from '~/common/util/trpc.client';

import type { EgregoreAccessSchema } from '../../server/egregore/egregore.router';


export function EgregoreAdministration(props: { access: EgregoreAccessSchema, onClose: () => void }) {

  // state
  const [selectedModelName, setSelectedModelName] = React.useState<string>('');
  const [pullableModels, setPullableModels] = React.useState<{ id: string; label: string; tag: string; tags: string[]; description: string; pulls: number; isNew: boolean }[]>([]);
  const [pullingModel, setPullingModel] = React.useState<string | null>(null);
  const [pullStatus, setPullStatus] = React.useState<string>('');
  const [pullError, setPullError] = React.useState<string | null>(null);

  // load data
  React.useEffect(() => {
    apiAsync.llmEgregore.adminListPullable.query({ access: props.access })
      .then(result => setPullableModels(result.pullableModels))
      .catch(err => console.error('Failed to load pullable models:', err));
  }, [props.access]);

  const handlePullModel = async (modelName: string) => {
    setPullingModel(modelName);
    setPullStatus('');
    setPullError(null);
    try {
      const result = await apiAsync.llmEgregore.adminPull.mutate({ access: props.access, name: modelName });
      setPullStatus(result.status || 'Completed');
      if (result.error)
        setPullError(result.error);
    } catch (error: any) {
      setPullError(error?.message || 'Unknown error');
    } finally {
      setPullingModel(null);
    }
  };

  const handleDeleteModel = async (modelName: string) => {
    try {
      await apiAsync.llmEgregore.adminDelete.mutate({ access: props.access, name: modelName });
      // Optionally refresh the model list or show a success message
    } catch (error: any) {
      console.error('Failed to delete model:', error);
    }
  };

  return (
    <GoodModal
      title='Egregore AI Runner Administration'
      strongerTitle
      open
      onClose={props.onClose}
      sx={{ maxWidth: 600 }}
    >

      {/* Pull Models Section */}
      <Box sx={{ mb: 3 }}>
        <Typography level='title-md' sx={{ mb: 2 }}>
          <FormatListNumberedRtlIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Available Models
        </Typography>

        <FormControl sx={{ mb: 2 }}>
          <FormLabelStart title='Select Model to Pull' />
          <Autocomplete
            placeholder='Choose a model...'
            options={pullableModels.map(m => m.id)}
            value={selectedModelName}
            onChange={(_event, newValue) => setSelectedModelName(newValue || '')}
            getOptionLabel={(option) => {
              const model = pullableModels.find(m => m.id === option);
              return model ? model.label : option;
            }}
            renderOption={(props, option) => {
              const model = pullableModels.find(m => m.id === option);
              return (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{model?.label || option}</Typography>
                    {model?.isNew && <Chip size='sm' color='success' variant='soft'>New</Chip>}
                    <Typography level='body-xs' sx={{ ml: 'auto' }}>
                      {model?.pulls?.toLocaleString()} pulls
                    </Typography>
                  </Box>
                </li>
              );
            }}
          />
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant='solid'
            color='primary'
            disabled={!selectedModelName || !!pullingModel}
            loading={!!pullingModel && pullingModel === selectedModelName}
            onClick={() => handlePullModel(selectedModelName)}
          >
            Pull Model
          </Button>

          {selectedModelName && (
            <IconButton
              variant='outlined'
              component='a'
              href={`https://ollama.ai/library/${selectedModelName}`}
              target='_blank'
              title='View on Ollama Library'
            >
              <LaunchIcon />
            </IconButton>
          )}
        </Box>

        {pullStatus && (
          <Typography level='body-sm' sx={{ mb: 1, color: pullError ? 'danger.solidBg' : 'success.solidBg' }}>
            {pullStatus}
          </Typography>
        )}

        {pullError && (
          <Typography level='body-sm' sx={{ color: 'danger.solidBg' }}>
            Error: {pullError}
          </Typography>
        )}
      </Box>

      {/* Model Management Section */}
      <Box>
        <Typography level='title-md' sx={{ mb: 2 }}>
          Model Management
        </Typography>

        <Typography level='body-sm' sx={{ mb: 2 }}>
          Use the model list above to pull new models. Currently installed models can be managed through the main interface.
        </Typography>
      </Box>

    </GoodModal>
  );
}