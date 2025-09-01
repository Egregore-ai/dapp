// pages/_app.tsx
import * as React from 'react';
import Head from 'next/head';
import { MyAppProps } from 'next/app';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next';

import { Brand } from '~/common/app.config';
import { apiQuery } from '~/common/util/trpc.client';

import 'katex/dist/katex.min.css';
import '~/common/styles/CodePrism.css';
import '~/common/styles/GithubMarkdown.css';
import '~/common/styles/NProgress.css';
import '~/common/styles/agi.effects.css';
import '~/common/styles/app.styles.css';

// RainbowKit / wagmi / React Query
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '~/modules/lib/wagmi';

import { WagmiProvider, useAccount } from 'wagmi';
import WalletGate from '~/common/components/WalletGate';

import { ErrorBoundary } from '~/common/components/ErrorBoundary';
import { Is } from '~/common/util/pwaUtils';
import { OverlaysInsert } from '~/common/layout/overlays/OverlaysInsert';
import { ProviderBackendCapabilities } from '~/common/providers/ProviderBackendCapabilities';
import { ProviderBootstrapLogic } from '~/common/providers/ProviderBootstrapLogic';
import { ProviderSingleTab } from '~/common/providers/ProviderSingleTab';
import { ProviderTheming } from '~/common/providers/ProviderTheming';
import { SnackbarInsert } from '~/common/components/snackbar/SnackbarInsert';
import { hasGoogleAnalytics, OptionalGoogleAnalytics } from '~/common/components/3rdparty/GoogleAnalytics';
import { hasPostHogAnalytics, OptionalPostHogAnalytics } from '~/common/components/3rdparty/PostHogAnalytics';

const queryClient = new QueryClient(); 

function TopBarVisibilityGuard() {
  const { isConnected } = useAccount();
}
const Dapp_AGI_App = ({ Component, emotionCache, pageProps }: MyAppProps) => {
  const getLayout = (Component as any).getLayout ?? ((page: any) => page);

  return (
    <>
      <Head>
        <title>{Brand.Title.Common}</title>
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no' />
      </Head>

       <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()}>
            <ProviderTheming emotionCache={emotionCache}>
              <ProviderSingleTab>
                <ProviderBackendCapabilities>
                  <ErrorBoundary outer>
                    <ProviderBootstrapLogic>
                      <SnackbarInsert />

                      <WalletGate>
                        {getLayout(<Component {...pageProps} />)}
                      </WalletGate>

                      <OverlaysInsert />
                    </ProviderBootstrapLogic>
                  </ErrorBoundary>
                </ProviderBackendCapabilities>
              </ProviderSingleTab>
            </ProviderTheming>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>

      {Is.Deployment.VercelFromFrontend && <VercelAnalytics debug={false} />}
      {Is.Deployment.VercelFromFrontend && <VercelSpeedInsights debug={false} sampleRate={1 / 2} />}
      {hasGoogleAnalytics && <OptionalGoogleAnalytics />}
      {hasPostHogAnalytics && <OptionalPostHogAnalytics />}
    </>
  );
};

export default apiQuery.withTRPC(Dapp_AGI_App);
