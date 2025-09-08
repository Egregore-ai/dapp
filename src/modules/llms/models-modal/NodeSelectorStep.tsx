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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
  const [isLoading, setIsLoading] = React.useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onContinue(choice);
    setIsLoading(false);
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
          Specify Your Usage Model
        </Typography>
        <Typography level="body-lg" sx={{ color: 'text.tertiary' }}>
          How would you like to use Egregore?
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
          Select deployment type
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
            sx={{
              p: 2.5,
              borderRadius: 'lg',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'sm',
              }
            }}
          >
            <Radio
              value="own"
              overlay
              disableIcon
              label={
                <Box sx={{ display: 'grid', gap: 0.25 }}>
                  <Typography level="title-sm">Local Model</Typography>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    Model runs securely within your environment with complete control and privacy.
                  </Typography>
                </Box>
              }
            />
          </Sheet>

          <Sheet
            variant={choice === 'global' ? 'solid' : 'outlined'}
            color={choice === 'global' ? 'primary' : 'neutral'}
            sx={{
              p: 2.5,
              borderRadius: 'lg',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'sm',
              }
            }}
          >
            <Radio
              value="global"
              overlay
              disableIcon
              label={
                <Box sx={{ display: 'grid', gap: 0.25 }}>
                  <Typography level="title-sm">Global Network</Typography>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    Connect to any preferred node worldwide with fast deployment and shared resources.
                  </Typography>
                </Box>
              }
            />
          </Sheet>
        </RadioGroup>
      </FormControl>

      <Box sx={{
        display: 'flex',
        gap: 2,
        justifyContent: isMobile ? 'stretch' : 'space-between',
        alignItems: 'center',
        flexDirection: isMobile ? 'column' : 'row',
        mt: 3
      }}>
        <Button
          variant="outlined"
          color="neutral"
          component={JoyLink}
          href={githubURL}
          target="_blank"
          rel="noopener noreferrer"
          startDecorator={<GitHubIcon />}
          sx={{
            minHeight: 44,
            px: 3,
            fontWeight: 500,
            borderRadius: 'lg',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 'sm',
            }
          }}
        >
          Learn More
        </Button>

        <Button
          variant="solid"
          color="primary"
          onClick={handleContinue}
          loading={isLoading}
          endDecorator={!isLoading && <ArrowForwardIcon />}
          sx={{
            minHeight: 44,
            px: 4,
            fontWeight: 600,
            borderRadius: 'lg',
            minWidth: isMobile ? '100%' : 140,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 'md',
            },
            '&:active': {
              transform: 'translateY(0px)',
            }
          }}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}

export default NodeSelectorStep;