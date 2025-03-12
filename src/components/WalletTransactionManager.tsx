import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useWalletStore } from '../store/walletStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Transaction } from '../types/wallet';

export const WalletTransactionManager = () => {
  const { 
    address, 
    isConnected, 
    transactions, 
    isLoading,
    balance,
    connect, 
    disconnect,
    sendTransaction 
  } = useWalletStore();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    to: '',
    amount: ''
  });

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Format address for display
  const shortenedAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  // Handle form submission with multiple addresses
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (!formData.to || isNaN(amount)) return;
    
    // Split addresses by comma and trim whitespace
    const addresses = formData.to.split(',').map(addr => addr.trim()).filter(Boolean);
    
    // Send transaction to each address
    for (const to of addresses) {
      await sendTransaction(to, amount / addresses.length);
    }
    
    setFormData({ to: '', amount: '' });
  }, [formData, sendTransaction]);

  // Handle form input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Get status color for transaction
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-500 dark:text-yellow-400';
      case 'Success': return 'text-green-500 dark:text-green-400';
      case 'Failed': return 'text-red-500 dark:text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <ToastContainer position="top-right" theme={isDarkMode ? 'dark' : 'light'} />
        
        {/* Header with Dark Mode Toggle */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Wallet Manager</h1>
          <button
            onClick={() => setIsDarkMode(prev => !prev)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
          >
            {isDarkMode ? (
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Wallet Connection and Balance */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-dark-600 dark:text-dark-300">
                {isConnected ? shortenedAddress : 'Not Connected'}
              </span>
            </div>
            <button
              onClick={isConnected ? disconnect : connect}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                isConnected 
                  ? 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' 
                  : 'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
            </button>
          </div>
          
          {/* Balance Display */}
          {isConnected && (
            <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-dark-600 dark:text-dark-300">Balance:</span>
                <span className="text-lg font-bold text-dark-900 dark:text-white">{balance} ETH</span>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white dark:bg-dark-800 rounded-lg shadow-sm">
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Recipient Addresses
            </label>
            <div className="text-xs text-dark-500 dark:text-dark-400 mb-2">
              Multiple addresses can be separated by commas
            </div>
            <input
              type="text"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent"
              placeholder="0x... , 0x..."
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Amount (ETH)
            </label>
            <div className="text-xs text-dark-500 dark:text-dark-400 mb-2">
              Amount will be split equally between recipients
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent"
              placeholder="0.0"
              step="0.0001"
              min="0"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-medium rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Send Transaction'}
          </button>
        </form>

        {/* Transaction History */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 bg-white dark:bg-dark-800 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-dark-900 dark:text-white">
                      To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                    </p>
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                      Amount: {tx.amount} ETH
                    </p>
                    <p className="text-xs text-dark-500 dark:text-dark-400 font-mono break-all">
                      Hash: {tx.hash}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-2">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 