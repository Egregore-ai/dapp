// src/modules/llms/models/NodeChoiceRequiredModal.tsx
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
} from '@mui/joy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { GoodModal } from '~/common/components/modals/GoodModal';
import { optimaActions } from '~/common/layout/optima/useOptima';
import { nodeChoiceActions } from '~/common/stores/nodeChoice.store';
import { useIsMobile } from '~/common/components/useMatchMedia';

type Choice = 'own' | 'global';

export function NodeChoiceRequiredModal() {
  const [choice, setChoice] = React.useState<Choice>('own');
  const [isLoading, setIsLoading] = React.useState(false);
  const isMobile = useIsMobile();

  const handleContinue = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    nodeChoiceActions.set(choice);
    setIsLoading(false);
    // Modal will automatically close when node choice is set
  };

  return (
    <GoodModal
      title={
        <Typography level="h4" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
          Specify Your Usage Model
        </Typography>
      }
      open
      onClose={optimaActions().closeModels}
      animateEnter
      unfilterBackdrop
      autoOverflow={true}
    >
      <Box sx={{ display: 'grid', gap: 2, p: 1 }}>
        <Typography level="body-lg" sx={{ color: 'text.tertiary', textAlign: 'center' }}>
          How would you like to use AI models?
        </Typography>

        <Divider />

        <FormControl sx={{ maxWidth: 640, mx: 'auto', width: '100%' }}>
          <FormLabel
            sx={{
              fontWeight: 600,
              mb: 2,
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
              gap: 1.5,
            }}
          >
            <Sheet
              variant={choice === 'own' ? 'solid' : 'outlined'}
              color={choice === 'own' ? 'primary' : 'neutral'}
              sx={{
                p: 3,
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
                  <Box sx={{ display: 'grid', gap: 0.5 }}>
                    <Typography level="title-md" sx={{ fontWeight: 600 }}>
                      Local Model
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                      Model runs securely within your environment with complete control and privacy.
                      Connect to local services like Ollama, LocalAI, or LM Studio.
                    </Typography>
                  </Box>
                }
              />
            </Sheet>

            <Sheet
              variant={choice === 'global' ? 'solid' : 'outlined'}
              color={choice === 'global' ? 'primary' : 'neutral'}
              sx={{
                p: 3,
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
                  <Box sx={{ display: 'grid', gap: 0.5 }}>
                    <Typography level="title-md" sx={{ fontWeight: 600 }}>
                      Global Network
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                      Connect to cloud-based AI services from providers like OpenAI, Anthropic, 
                      DeepSeek, and OpenRouter for instant access.
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
          justifyContent: 'center',
          mt: 2
        }}>
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
              minWidth: isMobile ? '100%' : 160,
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
    </GoodModal>
  );
}