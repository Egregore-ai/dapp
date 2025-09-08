// src/common/layout/bar/WalletMenuButton.tsx
'use client';

import * as React from 'react';
import {
  Dropdown, Menu, MenuButton, MenuItem, ListItemDecorator, Divider, Chip, Typography, Avatar, Tooltip, Box, IconButton,
  Modal, ModalDialog, ModalClose, Button, FormControl, FormLabel, Input
} from '@mui/joy';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';

import { useAccount, useDisconnect, useEnsName, useChainId, useBalance } from 'wagmi';
import { useConnectModal, useChainModal } from '@rainbow-me/rainbowkit';
import { useNodeChoice, useNodeConfig, useIsNodeConfigured, nodeChoiceActions } from '~/common/stores/nodeChoice.store';

const iconStyle = {
  fontSize: '20px',
  width: '20px',
  height: '20px',
};

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

function NodeSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nodeChoice = useNodeChoice();
  const nodeConfig = useNodeConfig();
  const [key, setKey] = React.useState(nodeConfig.key || '');
  const [errors, setErrors] = React.useState<{ key?: string }>({});

  React.useEffect(() => {
    if (nodeConfig.key && nodeConfig.key !== key) {
      setKey(nodeConfig.key);
    }
  }, [nodeConfig.key]);

  const handleSave = () => {
    if (nodeChoice === 'own') {
      const newErrors: { key?: string } = {};
      
      if (!key.trim()) {
        newErrors.key = 'Authentication key is required for Local Model';
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        nodeChoiceActions.setConfig({ key: key.trim() });
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleNodeTypeChange = (newChoice: 'own' | 'global') => {
    nodeChoiceActions.set(newChoice);
    if (newChoice === 'global') {
      setKey('');
      setErrors({});
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ minWidth: 400, maxWidth: 500 }}>
        <ModalClose />
        
        <Typography level="h4" sx={{ mb: 2 }}>
          Settings
        </Typography>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormControl>
            <FormLabel>Node Type</FormLabel>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={nodeChoice === 'own' ? 'solid' : 'outlined'}
                color={nodeChoice === 'own' ? 'primary' : 'neutral'}
                size="sm"
                onClick={() => handleNodeTypeChange('own')}
              >
                Local Model
              </Button>
              <Button
                variant={nodeChoice === 'global' ? 'solid' : 'outlined'}
                color={nodeChoice === 'global' ? 'primary' : 'neutral'}
                size="sm"
                onClick={() => handleNodeTypeChange('global')}
              >
                Global Network
              </Button>
            </Box>
          </FormControl>

          {nodeChoice === 'own'  && (
            <FormControl error={!!errors.key}>
              <FormLabel>
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
          )}
  {nodeChoice === 'global'   && (
            <FormControl error={!!errors.key}>
              <FormLabel>
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
          )}

    
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" color="neutral" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="solid" 
              color="primary" 
              onClick={handleSave}
              disabled={nodeChoice === 'own' && !key.trim() && !nodeConfig.key}
            >
              {nodeChoice === 'own' && nodeConfig.key && !key.trim() ? 'Keep Existing Key' : 'Save'}
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}

export default function WalletMenuButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: ensName } = useEnsName({ address });
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  
  const nodeChoice = useNodeChoice();
  const nodeConfig = useNodeConfig();
  const isNodeConfigured = useIsNodeConfigured();

  const [nodeSettingsOpen, setNodeSettingsOpen] = React.useState(false);

  const meta = getChainMeta(chainId);
  const label = ensName ?? shortAddr(address);

  const { data: balData } = useBalance({
    address: (address as `0x${string}`) || undefined,
    watch: true,
    enabled: isConnected && !!address,
  });

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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Dropdown>
          <MenuButton
            variant="plain"
            sx={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: 1,
              '&:hover': { 
                backgroundColor: 'rgba(255 255 255 / 0.06)',
              },
              '&:focus': {
                outline: 'none',
                boxShadow: 'none',
              },
              '--joy-palette-focusVisible': 'transparent',
              '--Button-gap': '0px',
            }}
          >
            <AccountBalanceWalletOutlinedIcon sx={iconStyle} />
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

          {isConnected && nodeChoice !== 'unset' && (
            <MenuItem disabled sx={{ opacity: 1, cursor: 'default', py: 0.5 }}>
              <ListItemDecorator>
                <StorageIcon sx={iconStyle} />
              </ListItemDecorator>
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                Type
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                <Typography level="body-xs">
                  {nodeChoice === 'own' ? 'Local Model' : 'Global Network'}
                </Typography>
                <Chip 
                  size="sm" 
                  variant="soft" 
                  color={isNodeConfigured ? 'success' : 'warning'}
                >
                  {isNodeConfigured ? '✓' : '!'}
                </Chip>
              </Box>
            </MenuItem>
          )}

          <Divider inset="context" />

          {!isConnected ? (
            <MenuItem onClick={() => openConnectModal?.()}>
              <ListItemDecorator><LoginIcon sx={iconStyle} /></ListItemDecorator>
              Connect Wallet
            </MenuItem>
          ) : (
            <>
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'} placement="left" variant="soft" color={copied ? 'success' : 'neutral'}>
                <MenuItem onClick={copyAddr} disabled={!address}>
                  <ListItemDecorator><ContentCopyIcon sx={iconStyle} /></ListItemDecorator>
                  Copy Address
                </MenuItem>
              </Tooltip>

              <MenuItem onClick={() => openChainModal?.()}>
                <ListItemDecorator><SyncAltIcon sx={iconStyle} /></ListItemDecorator>
                Switch Network
              </MenuItem>

              <MenuItem onClick={openExplorer} disabled={!address || !meta.explorer}>
                <ListItemDecorator><OpenInNewIcon sx={iconStyle} /></ListItemDecorator>
                View on Explorer
              </MenuItem>

              {nodeChoice !== 'unset' && (
                <MenuItem onClick={() => setNodeSettingsOpen(true)}>
                  <ListItemDecorator><SettingsIcon sx={iconStyle} /></ListItemDecorator>
                  Specify Your Usage Model
                </MenuItem>
              )}

              <Divider inset="context" />

              <MenuItem color="danger" onClick={hardLogout}>
                <ListItemDecorator><LogoutIcon sx={iconStyle} /></ListItemDecorator>
                Disconnect
              </MenuItem>
            </>
          )}
        </Menu>
      </Dropdown>

      <NodeSettingsModal 
        open={nodeSettingsOpen} 
        onClose={() => setNodeSettingsOpen(false)} 
      />
    </Box>
  );
}