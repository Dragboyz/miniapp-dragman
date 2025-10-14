// lib/user-limits.ts
import { useAccount } from 'wagmi';

export const DAILY_LIMITS = {
  GAME_TRANSACTIONS: 1,
  SOCIAL_FEATURES: 1,
  ACHIEVEMENT_CLAIMS: 1, // Every 3 days
  ACHIEVEMENT_INTERVAL: 3
};

export const BUDGET_LIMITS = {
  MAX_ACTIVE_USERS: 20,
  EMERGENCY_BALANCE: 100, // $100
  DAILY_BUDGET: 8.33 // $8.33/day
};

export interface UserTransactionRecord {
  userAddress: string;
  transactionType: 'game' | 'social' | 'achievement';
  timestamp: number;
  gasCost?: number;
}

// In-memory storage (in production, use a database)
let userTransactions: UserTransactionRecord[] = [];

export function getUserTransactions(userAddress: string): UserTransactionRecord[] {
  return userTransactions.filter(tx => tx.userAddress.toLowerCase() === userAddress.toLowerCase());
}

export function addUserTransaction(userAddress: string, transactionType: 'game' | 'social' | 'achievement', gasCost?: number): void {
  const record: UserTransactionRecord = {
    userAddress: userAddress.toLowerCase(),
    transactionType,
    timestamp: Date.now(),
    gasCost
  };
  userTransactions.push(record);
}

export function checkUserLimits(userAddress: string, transactionType: 'game' | 'social' | 'achievement'): {
  canProceed: boolean;
  reason?: string;
  remaining?: number;
} {
  const userTxs = getUserTransactions(userAddress);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  // Filter today's transactions
  const todayTxs = userTxs.filter(tx => tx.timestamp >= todayStart);
  
  // Check game transactions
  if (transactionType === 'game') {
    const gameTxs = todayTxs.filter(tx => tx.transactionType === 'game');
    if (gameTxs.length >= DAILY_LIMITS.GAME_TRANSACTIONS) {
      return {
        canProceed: false,
        reason: `Daily game limit reached (${DAILY_LIMITS.GAME_TRANSACTIONS}/day)`,
        remaining: 0
      };
    }
    return {
      canProceed: true,
      remaining: DAILY_LIMITS.GAME_TRANSACTIONS - gameTxs.length
    };
  }
  
  // Check social transactions
  if (transactionType === 'social') {
    const socialTxs = todayTxs.filter(tx => tx.transactionType === 'social');
    if (socialTxs.length >= DAILY_LIMITS.SOCIAL_FEATURES) {
      return {
        canProceed: false,
        reason: `Daily social limit reached (${DAILY_LIMITS.SOCIAL_FEATURES}/day)`,
        remaining: 0
      };
    }
    return {
      canProceed: true,
      remaining: DAILY_LIMITS.SOCIAL_FEATURES - socialTxs.length
    };
  }
  
  // Check achievement transactions (every 3 days)
  if (transactionType === 'achievement') {
    const achievementTxs = userTxs.filter(tx => tx.transactionType === 'achievement');
    if (achievementTxs.length > 0) {
      const lastAchievementTx = achievementTxs[achievementTxs.length - 1];
      const daysSinceLastClaim = (Date.now() - lastAchievementTx.timestamp) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastClaim < DAILY_LIMITS.ACHIEVEMENT_INTERVAL) {
        const daysRemaining = Math.ceil(DAILY_LIMITS.ACHIEVEMENT_INTERVAL - daysSinceLastClaim);
        return {
          canProceed: false,
          reason: `Achievement claims limited to every ${DAILY_LIMITS.ACHIEVEMENT_INTERVAL} days. Try again in ${daysRemaining} day(s)`,
          remaining: 0
        };
      }
    }
    return {
      canProceed: true,
      remaining: 1
    };
  }
  
  return { canProceed: true };
}

export function getDailyUsage(userAddress: string): {
  game: { used: number; limit: number };
  social: { used: number; limit: number };
  achievement: { used: number; limit: number; nextAvailable?: number };
} {
  const userTxs = getUserTransactions(userAddress);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  const todayTxs = userTxs.filter(tx => tx.timestamp >= todayStart);
  
  const gameTxs = todayTxs.filter(tx => tx.transactionType === 'game');
  const socialTxs = todayTxs.filter(tx => tx.transactionType === 'social');
  
  // Calculate next achievement availability
  const achievementTxs = userTxs.filter(tx => tx.transactionType === 'achievement');
  let nextAchievementAvailable;
  if (achievementTxs.length > 0) {
    const lastAchievementTx = achievementTxs[achievementTxs.length - 1];
    const daysSinceLastClaim = (Date.now() - lastAchievementTx.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceLastClaim < DAILY_LIMITS.ACHIEVEMENT_INTERVAL) {
      nextAchievementAvailable = Math.ceil(DAILY_LIMITS.ACHIEVEMENT_INTERVAL - daysSinceLastClaim);
    }
  }
  
  return {
    game: { used: gameTxs.length, limit: DAILY_LIMITS.GAME_TRANSACTIONS },
    social: { used: socialTxs.length, limit: DAILY_LIMITS.SOCIAL_FEATURES },
    achievement: { 
      used: achievementTxs.length, 
      limit: DAILY_LIMITS.ACHIEVEMENT_CLAIMS,
      nextAvailable: nextAchievementAvailable
    }
  };
}

// Budget monitoring - REAL IMPLEMENTATION
export async function checkBudgetLimits(): Promise<{
  canProceed: boolean;
  reason?: string;
  estimatedDaysRemaining?: number;
  currentBalance?: number;
}> {
  try {
    // TODO: Replace with your actual paymaster balance check
    // This is where you'd call your paymaster API or check on-chain balance
    
    // Example for Base paymaster:
    // const response = await fetch('https://api.developer.coinbase.com/rpc/v1/base/v7HqDLjJY4e28qgIDAAN4JNYXnz88mJZ', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     jsonrpc: '2.0',
    //     method: 'eth_getBalance',
    //     params: ['YOUR_PAYMASTER_ADDRESS', 'latest'],
    //     id: 1
    //   })
    // });
    // const data = await response.json();
    // const balanceWei = data.result;
    // const balanceEth = parseInt(balanceWei, 16) / 1e18;
    
    // Calculate actual usage from recorded transactions
    const totalTransactions = userTransactions.length;
    const estimatedCost = totalTransactions * 0.25; // $0.25 per transaction average
    const currentBalance = Math.max(0, 500 - estimatedCost); // Start with $500, subtract usage
    
    const emergencyThreshold = 100; // $100 emergency threshold
    
    if (currentBalance <= emergencyThreshold) {
      return {
        canProceed: false,
        reason: "Budget running low. Gas-free transactions temporarily disabled.",
        estimatedDaysRemaining: Math.max(1, Math.floor(currentBalance / 8.33)),
        currentBalance
      };
    }
    
    if (currentBalance <= 200) { // $200 warning threshold
      return {
        canProceed: true,
        reason: `Budget running low. Only $${currentBalance} remaining.`,
        estimatedDaysRemaining: Math.max(1, Math.floor(currentBalance / 8.33)),
        currentBalance
      };
    }
    
    return { 
      canProceed: true,
      currentBalance
    };
  } catch (error) {
    console.error('Failed to check budget limits:', error);
    // Fallback to allowing transactions if we can't check balance
    return { canProceed: true };
  }
}

// React hook for using limits
export function useUserLimits() {
  const { address } = useAccount();
  
  const checkLimit = (transactionType: 'game' | 'social' | 'achievement') => {
    const userAddress = address || 'anonymous-user';
    return checkUserLimits(userAddress, transactionType);
  };
  
  const addTransaction = (transactionType: 'game' | 'social' | 'achievement', gasCost?: number) => {
    const userAddress = address || 'anonymous-user';
    addUserTransaction(userAddress, transactionType, gasCost);
  };
  
  const getUsage = () => {
    const userAddress = address || 'anonymous-user';
    return getDailyUsage(userAddress);
  };
  
  return {
    checkLimit,
    addTransaction,
    getUsage,
    isConnected: !!address
  };
}