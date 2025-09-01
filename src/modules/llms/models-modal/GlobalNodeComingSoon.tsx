// src/modules/llms/models-modal/GlobalNodeComingSoon.tsx
'use client';

import * as React from 'react';
import { Box, Button, Divider, Typography, Link as JoyLink } from '@mui/joy';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface GlobalNodeComingSoonProps {
  onBack: () => void;
  githubURL?: string;
}

export function GlobalNodeComingSoon({
  onBack,
  githubURL = 'https://github.com/DecentraLandMind',
}: GlobalNodeComingSoonProps) {
  return (
    <Box sx={{ display: 'grid', gap: 2, textAlign: 'center' }}>
      <Box sx={{ display: 'grid', gap: 1 }}>
        <Typography level="h4" sx={{ fontWeight: 700 }}>
          Global Node — Coming soon
        </Typography>
        <Typography level="body-md" sx={{ color: 'text.tertiary' }}>
          We&apos;re preparing a hosted, shared DecentraMind node for instant access.
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
          Stay tuned for updates!
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', gap: 1.2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button onClick={onBack} variant="outlined" color="neutral" startDecorator={<ArrowBackIcon />}>
          Back to Selection
        </Button>
        <Button
          variant="solid"
          color="primary"
          component={JoyLink}
          href={githubURL}
          target="_blank"
          rel="noopener noreferrer"
          startDecorator={<GitHubIcon />}
        >
          Follow Updates
        </Button>
      </Box>
    </Box>
  );
}

export default GlobalNodeComingSoon;
