'use client';

import * as React from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  Box,
  Button,
  Chip,
  Divider,
  Link as JoyLink,
  Sheet,
  Typography,
  useColorScheme, 
} from '@mui/joy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GitHubIcon from '@mui/icons-material/GitHub';
import Image from 'next/image';
import { NodeSelectorStep } from '~/modules/llms/models-modal/NodeSelectorStep';
import { useNodeChoice, nodeChoiceActions } from '~/common/stores/nodeChoice.store';

const GITHUB_URL = 'https://github.com/Egregore-ai/';

type Phase = 'preconnect' | 'select' | 'done';

interface WalletGateProps {
  children: React.ReactNode;
}

function HeaderArt({ src }: { src: string }) {
  return (
    <Box sx={{ borderRadius: 10, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', width: '100%', height: 90 }}>
        <Image src={src} alt="" fill style={{ objectFit: 'cover' }} priority />
      </Box>
    </Box>
  );
}

export default function WalletGate({ children }: WalletGateProps) {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { mode: colorMode } = useColorScheme();
  const isDark = colorMode === 'dark';

  const nodeChoice = useNodeChoice();

  const [phase, setPhase] = React.useState<Phase>('preconnect');

  React.useEffect(() => {
    if (isConnected) {
      if (nodeChoice !== 'unset') {
        setPhase('done');
      } else {
        setPhase('select');
      }
    } else {
      setPhase('preconnect');
    }
  }, [isConnected, nodeChoice]);

  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const handleNodeSelect = (choice: 'own' | 'global') => {
    nodeChoiceActions.set(choice);
    setPhase('done');
  };

  if (phase === 'done') return <>{children}</>;

  const sheetMaxWidth = phase === 'preconnect' ? 500 : 760;
  const contentMaxWidth = phase === 'preconnect' ? 460 : 640;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        backgroundColor: isDark ? 'background.body' : 'background.body',
      }}
    >
      <Sheet
        variant="soft"
        sx={{
          width: '100%',
          maxWidth: sheetMaxWidth,
          borderRadius: 16,
          boxShadow: 'lg',
          p: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))'
            : 'linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.01))',
          backdropFilter: 'blur(4px)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            variant="soft"
            color="primary"
            size="sm"
            startDecorator={<RocketLaunchIcon />}
          >
            Egregore
          </Chip>
        </Box>

        {phase === 'preconnect' && (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              maxWidth: contentMaxWidth,
              mx: 'auto',
              width: '100%',
              textAlign: 'left',
              mt: 1,
            }}
          >
            <Typography
              level="h3"
              sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}
            >
              Welcome to Egregore
            </Typography>

            <Box sx={{ display: 'grid', gap: 0.5 }}>
              <Typography level="body-md" sx={{ color: 'text.tertiary' }}>
                Here is where you can harness the ultimate power of AI with complete privacy.
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                Built on decentralized infrastructure powered by Functionland, developed by the Egregore team.
              </Typography>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <Button
                size="md"
                variant="solid"
                color="primary"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </Button>
              <Button
                size="md"
                variant="outlined"
                color="neutral"
                component={JoyLink}
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                startDecorator={<GitHubIcon />}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        )}

        {phase === 'select' && (
          <Box sx={{ maxWidth: contentMaxWidth, mx: 'auto', width: '100%', mt: 1 }}>
            <NodeSelectorStep
              isMobile={false}
              onContinue={handleNodeSelect}
              githubURL={GITHUB_URL}
            />
          </Box>
        )}
      </Sheet>
    </Box>
  );
}