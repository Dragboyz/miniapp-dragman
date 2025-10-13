import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export interface BaseAccountCapabilities {
  atomicBatch: boolean;
  paymasterService: boolean;
  auxiliaryFunds: boolean;
}

export function useBaseAccountCapabilities(address?: string) {
  const [capabilities, setCapabilities] = useState<BaseAccountCapabilities>({
    atomicBatch: false,
    paymasterService: false,
    auxiliaryFunds: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function detect() {
      if (!address) return;

      setLoading(true);
      setError(null);

      try {
        // Check if we're in a Base Mini App environment
        const isInBaseApp = typeof window !== 'undefined' && window.parent !== window;
        
        if (isInBaseApp) {
          // In Base Mini App, assume Base Account capabilities are available
          setCapabilities({
            atomicBatch: true,
            paymasterService: true,
            auxiliaryFunds: true,
          });
        } else {
          // Outside Base Mini App, use defaults
          setCapabilities({
            atomicBatch: false,
            paymasterService: false,
            auxiliaryFunds: false,
          });
        }
      } catch (err) {
        console.error('Failed to detect Base Account capabilities:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    detect();
  }, [address]);

  return { capabilities, loading, error };
}

export function useBaseAccountFeatures() {
  const { address } = useAccount();
  const { capabilities, loading, error } = useBaseAccountCapabilities(address);

  const isBaseAccount = capabilities.atomicBatch || capabilities.paymasterService || capabilities.auxiliaryFunds;

  return {
    address,
    capabilities,
    isBaseAccount,
    loading,
    error,
  };
}
