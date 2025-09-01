// src/lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;
export const wagmiConfig = getDefaultConfig({
  appName: 'dapp-AGI',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [mainnet],                 
  ssr: true,
});
