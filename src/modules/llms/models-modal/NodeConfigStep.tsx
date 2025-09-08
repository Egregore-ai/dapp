// src/modules/llms/models-modal/NodeConfigStep.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Link as JoyLink,
} from '@mui/joy';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNodeConfig } from '~/common/stores/nodeChoice.store';

interface NodeConfigStepProps {
  onContinue: (key: string) => void;
  onBack: () => void;
  githubURL?: string;
}

export function NodeConfigStep({
  onContinue,
  onBack,
  githubURL = 'https://github.com/DecentraLandMind',
}: NodeConfigStepProps) {
  const nodeConfig = useNodeConfig();
  
  // Initialize with stored key if exists
  const [key, setKey] = React.useState(nodeConfig.key || '');
  const [errors, setErrors] = React.useState<{ key?: string }>({});

  // Update local state if store changes
  React.useEffect(() => {
    if (nodeConfig.key && nodeConfig.key !== key) {
      setKey(nodeConfig.key);
    }
  }, [nodeConfig.key]);

  const handleContinue = () => {
    const newErrors: { key?: string } = {};
    
    if (!key.trim()) {
      newErrors.key = 'Key is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onContinue(key.trim());
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Typography
          level="h2"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.01em',
          }}
        >
          Configure Your Box
        </Typography>
        <Typography level="body-lg" sx={{ color: 'text.tertiary' }}>
          {nodeConfig.key 
            ? 'Update your authentication key or continue with the existing one.'
            : 'Enter your authentication key to connect.'
          }
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ display: 'grid', gap: 2, maxWidth: 480, mx: 'auto', width: '100%' }}>
        <FormControl error={!!errors.key}>
          <FormLabel sx={{ fontWeight: 600 }}>
            Authentication Key
            {nodeConfig.key && (
              <Typography level="body-xs" sx={{ color: 'text.tertiary', fontWeight: 400, ml: 1 }}>
                (Previously saved)
              </Typography>
            )}
          </FormLabel>
          <Input
            type="password"
            placeholder={nodeConfig.key ? 'Enter new key or keep existing' : 'Enter your authentication key'}
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              if (errors.key) {
                setErrors(prev => ({ ...prev, key: undefined }));
              }
            }}
          />
          {errors.key && (
            <Typography level="body-xs" sx={{ color: 'danger.500', mt: 0.5 }}>
              {errors.key}
            </Typography>
          )}
          
          {nodeConfig.key && (
            <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
              Leave empty to keep your existing key
            </Typography>
          )}
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', flexWrap: 'wrap', mt: 2 }}>
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<ArrowBackIcon />}
          onClick={onBack}
        >
          Back
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="neutral"
            component={JoyLink}
            href={githubURL}
            target="_blank"
            rel="noopener noreferrer"
            startDecorator={<GitHubIcon />}
          >
            Learn More
          </Button>
          <Button 
            variant="solid" 
            color="primary" 
            onClick={handleContinue}
            disabled={!key.trim() && !nodeConfig.key}
          >
            {nodeConfig.key && !key.trim() ? 'Continue with Existing Key' : 'Connect'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default NodeConfigStep;