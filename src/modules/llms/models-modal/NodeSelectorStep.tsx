// src/modules/llms/models-modal/NodeSelectorStep.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Sheet,
  Typography,
  Link as JoyLink,
} from '@mui/joy';
import GitHubIcon from '@mui/icons-material/GitHub';

type Choice = 'own' | 'global';

interface NodeSelectorStepProps {
  isMobile: boolean;
  onContinue: (choice: Choice) => void;
  githubURL?: string;
}

export function NodeSelectorStep({
  isMobile,
  onContinue,
  githubURL = 'https://github.com/DecentraLandMind',
}: NodeSelectorStepProps) {
  const [choice, setChoice] = React.useState<Choice>('own');

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
          Choose your Type
        </Typography>
        <Typography level="body-lg" sx={{ color: 'text.tertiary' }}>
          Select how you want to connect to DecentraMind.
        </Typography>
      </Box>

      <Divider />

      <FormControl sx={{ maxWidth: 640, mx: 'auto', width: '100%' }}>
        <FormLabel
          sx={{
            fontWeight: 600,
            mb: 1,
            textAlign: 'center',   
          }}
        >
          Select type
        </FormLabel>

        <RadioGroup
          value={choice}
          onChange={(e) => setChoice(e.target.value as Choice)}
          sx={{
            display: 'grid',
            gap: 1.25,
          }}
        >
          <Sheet
            variant={choice === 'own' ? 'solid' : 'outlined'}
            color={choice === 'own' ? 'primary' : 'neutral'}
            sx={{ p: 2.5, borderRadius: 'lg', cursor: 'pointer' }}
          >
            <Radio
              value="own"
              overlay
              disableIcon
              label={
                <Box sx={{ display: 'grid', gap: 0.25 }}>
                  <Typography level="title-sm">My box</Typography>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    Use your own machine/server to configure and run models. Full control & privacy.
                  </Typography>
                </Box>
              }
            />
          </Sheet>

          <Sheet
            variant={choice === 'global' ? 'solid' : 'outlined'}
            color={choice === 'global' ? 'primary' : 'neutral'}
            sx={{ p: 2.5, borderRadius: 'lg', cursor: 'pointer' }}
          >
            <Radio
              value="global"
              overlay
              disableIcon
              label={
                <Box sx={{ display: 'grid', gap: 0.25 }}>
                  <Typography level="title-sm">Global node</Typography>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    Connect to a public DecentraMind node. Fast onboarding, shared capacity.
                  </Typography>
                </Box>
              }
            />
          </Sheet>
        </RadioGroup>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap', mt: 2 }}>
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
        <Button variant="solid" color="primary" onClick={() => onContinue(choice)}>
          Continue
        </Button>
      </Box>
    </Box>
  );
}

export default NodeSelectorStep;
