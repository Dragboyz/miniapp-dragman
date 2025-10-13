'use client';

import React from 'react';
import { useBaseAccountFeatures } from '../lib/base-account';
import { useGasFreeTransaction } from '../lib/sponsored-transactions';
import { useMultiStepTransaction } from '../lib/transaction-batching';

interface BaseAccountFeaturesProps {
  children?: React.ReactNode;
}

export function BaseAccountFeatures({ children }: BaseAccountFeaturesProps) {
  const { capabilities, isBaseAccount, loading, error } = useBaseAccountFeatures();
  const { isGasFreeAvailable } = useGasFreeTransaction(capabilities);
  const { isMultiStepAvailable, requiresMultipleConfirmations } = useMultiStepTransaction(capabilities);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-700">Detecting Base Account capabilities...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <span className="text-yellow-700">⚠️ Capability detection failed: {error}</span>
        </div>
      </div>
    );
  }

  if (!isBaseAccount) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <span className="text-gray-700">🔗 Traditional wallet detected</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Some features may require multiple confirmations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <span className="text-green-700 font-semibold">🚀 Base Account detected!</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center">
          <span className="mr-2">
            {capabilities.atomicBatch ? '✅' : '❌'}
          </span>
          <span className="text-green-700">
            Atomic Batch: {capabilities.atomicBatch ? 'Available' : 'Not Available'}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="mr-2">
            {capabilities.paymasterService ? '✅' : '❌'}
          </span>
          <span className="text-green-700">
            Sponsored Gas: {capabilities.paymasterService ? 'Available' : 'Not Available'}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="mr-2">
            {capabilities.auxiliaryFunds ? '✅' : '❌'}
          </span>
          <span className="text-green-700">
            Auxiliary Funds: {capabilities.auxiliaryFunds ? 'Available' : 'Not Available'}
          </span>
        </div>
      </div>

      {isGasFreeAvailable && (
        <div className="mt-3 p-2 bg-green-100 rounded">
          <span className="text-green-800 text-sm">
            💰 Gas-free transactions enabled!
          </span>
        </div>
      )}

      {isMultiStepAvailable && (
        <div className="mt-3 p-2 bg-green-100 rounded">
          <span className="text-green-800 text-sm">
            ⚡ Multi-step transactions require only one confirmation!
          </span>
        </div>
      )}

      {children}
    </div>
  );
}

export function GasFreeButton({ 
  onClick, 
  children, 
  disabled = false 
}: { 
  onClick: () => void; 
  children: React.ReactNode; 
  disabled?: boolean;
}) {
  const { capabilities } = useBaseAccountFeatures();
  const { isGasFreeAvailable } = useGasFreeTransaction(capabilities);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
        isGasFreeAvailable
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isGasFreeAvailable ? '🚀 ' : ''}{children}
      {isGasFreeAvailable && <span className="text-xs ml-1">(Gas Free)</span>}
    </button>
  );
}

export function MultiStepButton({ 
  onClick, 
  children, 
  disabled = false 
}: { 
  onClick: () => void; 
  children: React.ReactNode; 
  disabled?: boolean;
}) {
  const { capabilities } = useBaseAccountFeatures();
  const { isMultiStepAvailable } = useMultiStepTransaction(capabilities);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
        isMultiStepAvailable
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isMultiStepAvailable ? '⚡ ' : ''}{children}
      {isMultiStepAvailable && <span className="text-xs ml-1">(One Click)</span>}
    </button>
  );
}
