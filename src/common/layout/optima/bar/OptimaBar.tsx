// src/common/layout/optima/OptimaBar.tsx
'use client';

import * as React from 'react';

import type { SxProps } from '@mui/joy/styles/types';
import { Box, IconButton, Typography } from '@mui/joy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { BigAgiSquircleIcon } from '~/common/components/icons/big-agi/BigAgiSquircleIcon';
import { Brand } from '~/common/app.config';
import { LayoutSidebarRight } from '~/common/components/icons/LayoutSidebarRight';
import { Link } from '~/common/components/Link';
import { checkVisibleNav, NavItemApp } from '~/common/app.nav';
import { navigateToIndex, ROUTE_INDEX } from '~/common/app.routes';

import { InvertedBar, InvertedBarCornerItem } from '../InvertedBar';
import { PopupPanel } from '../panel/PopupPanel';
import {
  optimaActions,
  optimaOpenDrawer,
  optimaOpenPanel,
  optimaTogglePanel,
  useOptimaPanelOpen,
} from '../useOptima';
import { useOptimaPortalHasInputs } from '../portals/useOptimaPortalHasInputs';
import { useOptimaPortalOutRef } from '../portals/useOptimaPortalOutRef';

import WalletMenuButton from './WalletMenuButton';

const centerItemsContainerSx: SxProps = {
  flexGrow: 1,
  minHeight: 'var(--Bar)',
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  alignItems: 'center',
  my: 'auto',
  gap: { xs: 0, md: 1 },
  overflow: 'hidden',
  WebkitAppRegion: 'drag',
  '& > *': { WebkitAppRegion: 'no-drag' },
};

function CenterItemsPortal(props: { currentApp?: NavItemApp }) {
  const portalToolbarRef = useOptimaPortalOutRef('optima-portal-toolbar', 'PageBar.CenterItemsContainer');
  const hasInputs = useOptimaPortalHasInputs('optima-portal-toolbar');

  return (
    <Box ref={portalToolbarRef} sx={centerItemsContainerSx}>
      {!hasInputs && <CenterItemsFallback currentApp={props.currentApp} />}
    </Box>
  );
}

function CenterItemsFallback(props: { currentApp?: NavItemApp }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
      <Link href={ROUTE_INDEX}>
        <BigAgiSquircleIcon inverted sx={{ width: 32, height: 32, color: 'white' }} />
      </Link>
      <Typography level="title-md">
        {props.currentApp?.barTitle || props.currentApp?.name || Brand.Title.Base}
      </Typography>
    </Box>
  );
}

export function OptimaBar(props: {
  component: React.ElementType;
  currentApp?: NavItemApp;
  isMobile: boolean;
  sx?: SxProps;
}) {
  const appMenuAnchor = React.useRef<HTMLButtonElement>(null);

  const hasDrawerContent = useOptimaPortalHasInputs('optima-portal-drawer');
  const {
    panelAsPopup,
    panelHasContent,
    panelShownAsPanel,
    panelShownAsPeeking,
    panelShownAsPopup,
  } = useOptimaPanelOpen(props.isMobile, props.currentApp);

  const navIsShown = checkVisibleNav(props.currentApp);
  const appUsesDrawer = !props.currentApp?.hideDrawer;
  const isDrawerOpenOrToggleable = appUsesDrawer && hasDrawerContent;

  React.useEffect(() => {
    const a = optimaActions();
    a.peekPanelLeave?.();
    const ae = document.activeElement as HTMLElement | null;
    if (ae && typeof ae.blur === 'function') ae.blur();
  }, []);

  if (props.currentApp?.hideBar && !props.isMobile && !panelHasContent) return null;

  return (
    <>
      {/* [Drawer/Back] [Center] [Wallet] [Panel] */}
      <InvertedBar component={props.component} direction="horizontal" sx={props.sx}>
        {(props.isMobile || !navIsShown) && (
          <InvertedBarCornerItem>
            {isDrawerOpenOrToggleable && navIsShown ? (
              <IconButton disabled={!hasDrawerContent} onPointerDown={optimaOpenDrawer}>
                <MenuIcon />
              </IconButton>
            ) : (
              <IconButton onClick={() => navigateToIndex()}>
                <ArrowBackIcon />
              </IconButton>
            )}
          </InvertedBarCornerItem>
        )}

        <CenterItemsPortal currentApp={props.currentApp} />

        {/* Wallet menu (Connect/Profile/Network/Disconnect) */}
        <InvertedBarCornerItem>
          <WalletMenuButton />
        </InvertedBarCornerItem>

        {panelHasContent && (
          <InvertedBarCornerItem
            onMouseEnter={
              props.isMobile || panelAsPopup || panelShownAsPanel
                ? undefined
                : optimaActions().peekPanelEnter
            }
            onMouseLeave={
              props.isMobile || panelShownAsPeeking ? undefined : optimaActions().peekPanelLeave
            }
          >
            <IconButton
              ref={appMenuAnchor}
              onClick={optimaTogglePanel}
              onContextMenu={optimaOpenPanel}
              sx={{ '&.Mui-focusVisible': { outline: 'none' } }}
            >
              {panelShownAsPanel ? (
                <NavigateNextIcon />
              ) : panelAsPopup ? (
                <MoreVertIcon />
              ) : (
                <LayoutSidebarRight />
              )}
            </IconButton>
          </InvertedBarCornerItem>
        )}
      </InvertedBar>

      {panelShownAsPopup && !!appMenuAnchor.current && (
        <PopupPanel anchorEl={appMenuAnchor.current} />
      )}
    </>
  );
}

export default OptimaBar;