// src/common/layout/bar/WalletMenuButton.tsx
'use client';

import * as React from 'react';
import {
  Dropdown, Menu, MenuButton, MenuItem, ListItemDecorator, Divider, Chip, Typography, Avatar, Tooltip
} from '@mui/joy';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, IconButton } from '@mui/joy';

import { useAccount, useDisconnect, useEnsName, useChainId, useBalance } from 'wagmi';
import { useConnectModal, useChainModal } from '@rainbow-me/rainbowkit';

function getChainMeta(chainId?: number) {
  switch (chainId) {
    case 1:   return { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' };
    case 11155111: return { name: 'Sepolia', symbol: 'ETH', explorer: 'https://sepolia.etherscan.io' };
    case 137: return { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' };
    case 10:  return { name: 'Optimism', symbol: 'ETH', explorer: 'https://optimistic.etherscan.io' };
    case 42161:return { name: 'Arbitrum', symbol: 'ETH', explorer: 'https://arbiscan.io' };
    case 8453:return { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org' };
    default:  return { name: `Chain #${chainId ?? '-'}`, symbol: '', explorer: '' };
  }
}

const shortAddr = (addr?: `0x${string}` | string, head = 6, tail = 4) =>
  addr ? `${addr.slice(0, head)}…${addr.slice(-tail)}` : '';

function WalletAvatar({ label }: { label?: string }) {
  const letter = (label || 'W').slice(0, 1).toUpperCase();
  return (
    <Avatar variant="soft" size="sm">
      {letter}
    </Avatar>
  );
}

export default function WalletMenuButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: ensName } = useEnsName({ address });
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  const meta = getChainMeta(chainId);
  const label = ensName ?? shortAddr(address);

  const { data: balData } = useBalance({
    address: (address as `0x${string}`) || undefined,
    watch: true,
    enabled: isConnected && !!address,
  });

  // Copy feedback
  const [copied, setCopied] = React.useState(false);
  const copyAddr = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const hardLogout = () => {
    disconnect();
    try {
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('rainbowkit.connected');
      Object.keys(localStorage)
        .filter(k => k.toLowerCase().includes('walletconnect'))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
    if (typeof window !== 'undefined') window.location.reload();
  };

  const openExplorer = () => {
    if (!address || !meta.explorer) return;
    window.open(`${meta.explorer}/address/${address}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dropdown>
      <MenuButton
        sx={{
          p: 1,
          borderRadius: 'md',
          '&:hover': { backgroundColor: 'rgba(255 255 255 / 0.06)' },
        }}
      >
        <AccountBalanceWalletOutlinedIcon />
      </MenuButton>

      <Menu
        variant="outlined"
        placement="bottom-end"
        sx={{
          minWidth: 300,
          p: 0.5,
          '--ListItem-minHeight': '40px',
        }}
      >
        {/* Header */}
        <MenuItem disabled sx={{ opacity: 1, cursor: 'default' }}>
          <ListItemDecorator>
            <WalletAvatar label={ensName || address} />
          </ListItemDecorator>
          <Box sx={{ display: 'grid', gap: 0.25, overflow: 'hidden' }}>
            <Typography level="body-sm" noWrap>
              {isConnected ? (ensName || shortAddr(address)) : 'Wallet'}
            </Typography>
            <Typography level="body-xs" sx={{ color: 'text.tertiary' }} noWrap>
              {isConnected ? meta.name : 'Not connected'}
            </Typography>
          </Box>
          {isConnected && (
            <Chip size="sm" variant="soft" sx={{ ml: 'auto' }}>
              #{chainId}
            </Chip>
          )}
        </MenuItem>

        {isConnected && (
          <MenuItem disabled sx={{ opacity: 1, cursor: 'default', py: 0.5 }}>
            <ListItemDecorator>
              <span style={{ width: 24, display: 'inline-block' }} />
            </ListItemDecorator>
            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
              Balance
            </Typography>
            <Typography level="body-xs" sx={{ ml: 'auto' }}>
              {balData?.formatted ? `${Number(balData.formatted).toFixed(4)} ${meta.symbol || balData.symbol}` : '—'}
            </Typography>
          </MenuItem>
        )}

        <Divider inset="context" />

        {/* Actions */}
        {!isConnected ? (
          <MenuItem onClick={() => openConnectModal?.()}>
            <ListItemDecorator><LoginIcon /></ListItemDecorator>
            Connect Wallet
          </MenuItem>
        ) : (
          <>
            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'} placement="left" variant="soft" color={copied ? 'success' : 'neutral'}>
              <MenuItem onClick={copyAddr} disabled={!address}>
                <ListItemDecorator><ContentCopyIcon /></ListItemDecorator>
                Copy Address
              </MenuItem>
            </Tooltip>

            <MenuItem onClick={() => openChainModal?.()}>
              <ListItemDecorator><SyncAltIcon /></ListItemDecorator>
              Switch Network
            </MenuItem>

            <MenuItem onClick={openExplorer} disabled={!address || !meta.explorer}>
              <ListItemDecorator><OpenInNewIcon /></ListItemDecorator>
              View on Explorer
            </MenuItem>

            <Divider inset="context" />

            <MenuItem color="danger" onClick={hardLogout}>
              <ListItemDecorator><LogoutIcon /></ListItemDecorator>
              Disconnect
            </MenuItem>
          </>
        )}
      </Menu>
    </Dropdown>
  );
}
