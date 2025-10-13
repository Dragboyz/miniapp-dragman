import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

export default config;
