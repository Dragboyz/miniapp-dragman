import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { BaseAccountCapabilities } from './base-account';

export interface BatchedTransaction {
  to: string;
  data: string;
  value?: bigint;
}

export function useTransactionBatching(capabilities: BaseAccountCapabilities) {
  const { address } = useAccount();

  const executeBatchedTransaction = async (transactions: BatchedTransaction[]) => {
    if (!capabilities.atomicBatch) {
      throw new Error('Atomic batch not available');
    }

    if (!address) {
      throw new Error('Account not available');
    }

    try {
      // Use window.ethereum for atomic batch transactions
      if (typeof window !== 'undefined' && window.ethereum) {
        const result = await window.ethereum.request({
          method: 'wallet_sendCalls',
          params: [
            {
              version: '1.0',
              chainId: '0x2105', // Base mainnet
              from: address,
              calls: transactions.map(tx => ({
                to: tx.to,
                data: tx.data,
                value: tx.value?.toString() || '0',
              })),
            },
          ],
        });

        return result;
      } else {
        throw new Error('Ethereum provider not available');
      }
    } catch (error) {
      console.error('Batched transaction failed:', error);
      throw error;
    }
  };

  const executeSequentialTransaction = async (transactions: BatchedTransaction[]) => {
    if (!address) {
      throw new Error('Account not available');
    }

    const results = [];
    
    for (const transaction of transactions) {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const result = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              from: address,
              to: transaction.to,
              data: transaction.data,
              value: transaction.value?.toString() || '0',
            }],
          });
          results.push(result);
        } else {
          throw new Error('Ethereum provider not available');
        }
      } catch (error) {
        console.error('Sequential transaction failed:', error);
        throw error;
      }
    }

    return results;
  };

  const executeTransaction = async (transactions: BatchedTransaction[]) => {
    if (capabilities.atomicBatch && transactions.length > 1) {
      return executeBatchedTransaction(transactions);
    } else {
      return executeSequentialTransaction(transactions);
    }
  };

  return {
    executeBatchedTransaction,
    executeSequentialTransaction,
    executeTransaction,
    isBatchingAvailable: capabilities.atomicBatch,
  };
}

export function useMultiStepTransaction(capabilities: BaseAccountCapabilities) {
  const { executeTransaction, isBatchingAvailable } = useTransactionBatching(capabilities);

  const executeMultiStepTransaction = async (steps: BatchedTransaction[]) => {
    if (isBatchingAvailable) {
      // Base Account: One confirmation for all steps
      return executeTransaction(steps);
    } else {
      // Traditional wallet: Multiple confirmations
      return executeTransaction(steps);
    }
  };

  return {
    executeMultiStepTransaction,
    isMultiStepAvailable: isBatchingAvailable,
    requiresMultipleConfirmations: !isBatchingAvailable,
  };
}
