import { useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useWriteContracts } from 'wagmi/experimental';
import { BaseAccountCapabilities } from './base-account';
import { checkBudgetLimits, checkUserLimits, addUserTransaction } from './user-limits';

export interface SponsoredTransactionConfig {
  paymasterService?: {
    url: string;
  };
}

export function useSponsoredTransactions(capabilities: BaseAccountCapabilities) {
  const account = useAccount();
  const chainId = useChainId();
  const { writeContracts } = useWriteContracts();

  const sponsoredConfig = useMemo(() => {
    if (!capabilities.paymasterService || !chainId) return {};

    // Base mainnet paymaster service URL
    const paymasterUrl = `https://api.developer.coinbase.com/rpc/v1/base/v7HqDLjJY4e28qgIDAAN4JNYXnz88mJZ`;

    return {
      paymasterService: {
        url: paymasterUrl,
      },
    };
  }, [capabilities.paymasterService, chainId]);

  const executeSponsoredTransaction = async (contracts: any[], transactionType?: 'game' | 'social' | 'achievement') => {
    if (!capabilities.paymasterService) {
      throw new Error('Paymaster service not available');
    }

    // Check budget limits first
    const budgetCheck = await checkBudgetLimits();
    if (!budgetCheck.canProceed) {
      throw new Error(budgetCheck.reason || 'Budget limit reached');
    }

    // Check user limits if transaction type is provided
    if (transactionType && account.address) {
      const limitCheck = checkUserLimits(account.address, transactionType);
      if (!limitCheck.canProceed) {
        throw new Error(limitCheck.reason || 'Daily limit reached');
      }
    }

    try {
      const result = await writeContracts({
        contracts,
        capabilities: sponsoredConfig,
      });

      // Record the transaction if successful
      if (transactionType && account.address) {
        addUserTransaction(account.address, transactionType);
      }

      return result;
    } catch (error) {
      console.error('Sponsored transaction failed:', error);
      throw error;
    }
  };

  return {
    sponsoredConfig,
    executeSponsoredTransaction,
    isSponsoredAvailable: capabilities.paymasterService,
  };
}

export function useGasFreeTransaction(capabilities: BaseAccountCapabilities) {
  const { executeSponsoredTransaction, isSponsoredAvailable } = useSponsoredTransactions(capabilities);

  const executeGasFreeTransaction = async (contractAddress: string, abi: any, functionName: string, args: any[], transactionType?: 'game' | 'social' | 'achievement') => {
    if (!isSponsoredAvailable) {
      throw new Error('Gas-free transactions not available');
    }

    const contracts = [{
      address: contractAddress,
      abi,
      functionName,
      args,
    }];

    return executeSponsoredTransaction(contracts, transactionType);
  };

  return {
    executeGasFreeTransaction,
    isGasFreeAvailable: isSponsoredAvailable,
  };
}
