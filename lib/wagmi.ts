import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';

export const queryClient = new QueryClient();

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    // walletConnect({ 
    //   projectId: 'your-walletconnect-project-id' // Uncomment and add your project ID if needed
    // }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
});

export default config;
