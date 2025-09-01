// src/common/components/WalletGate.tsx
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
} from '@mui/joy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GitHubIcon from '@mui/icons-material/GitHub';
import Image from 'next/image';
import { NodeSelectorStep } from '~/modules/llms/models-modal/NodeSelectorStep';
import { GlobalNodeComingSoon } from '~/modules/llms/models-modal/GlobalNodeComingSoon';
import { NodeConfigStep } from '~/modules/llms/models-modal/NodeConfigStep';
import { nodeChoiceActions } from '~/common/stores/nodeChoice.store';

const GITHUB_URL = 'https://github.com/DecentraLandMind';

type Phase = 'preconnect' | 'select' | 'config' | 'globalSoon' | 'done';

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
  const [phase, setPhase] = React.useState<Phase>('preconnect');

  React.useEffect(() => {
    if (isConnected && phase === 'preconnect') setPhase('select');
  }, [isConnected, phase]);

  const handleNodeSelect = (choice: 'own' | 'global') => {
    if (choice === 'own') {
      nodeChoiceActions.set('own');
      setPhase('config');
    } else {
      nodeChoiceActions.set('global');
      setPhase('globalSoon');
    }
  };

  const handleNodeConfig = (url: string, key: string) => {
    nodeChoiceActions.setConfig({ url, key });
    setPhase('done');
  };

  const handleConfigBack = () => setPhase('select');
  const handleGlobalBack = () => setPhase('select');

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
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.08)',
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
            DecentraMind
          </Chip>
        </Box>
        
        {/* <HeaderArt src="/images/covers/setup.png" /> */}
        
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
              sx={{ fontWeight: 800, letterSpacing: '-0.01em'}}
            >
              Welcome to DecentraMind
            </Typography>

            <Box sx={{ display: 'grid', gap: 0.5 }}>
              <Typography level="body-md" sx={{ color: 'text.tertiary' }}>
                A framework to run decentralized language models.
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                To continue, please connect your wallet.
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
                onClick={() => openConnectModal?.()}
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

        {phase === 'config' && (
          <Box sx={{ maxWidth: contentMaxWidth, mx: 'auto', width: '100%', mt: 1 }}>
            <NodeConfigStep
              onContinue={handleNodeConfig}
              onBack={handleConfigBack}
              githubURL={GITHUB_URL}
            />
          </Box>
        )}

        {phase === 'globalSoon' && (
          <Box sx={{ maxWidth: contentMaxWidth, mx: 'auto', width: '100%', mt: 1 }}>
            <GlobalNodeComingSoon
              onBack={handleGlobalBack}
              githubURL={GITHUB_URL}
            />
          </Box>
        )}
      </Sheet>
    </Box>
  );
}