import * as React from 'react';

import { Box } from '@mui/joy';
import type { SxProps } from '@mui/joy/styles/types';

export function BigAgiSquircleIcon(props: { inverted?: boolean, altColor?: string, size?: number, sx?: SxProps }) {
  const { inverted, altColor, size = 24, sx, ...rest } = props;

  return (
    <Box
      component="img"
      src="/favicon.ico"
      alt="icon"
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        ...sx,
      }}
      {...rest}
    />
  );
}