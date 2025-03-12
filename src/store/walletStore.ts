import { create } from 'zustand';
import { Transaction, WalletState } from '../types/wallet';
import { web3Service } from '../services/web3Service';
import { toast } from 'react-toastify';

interface WalletStore extends WalletState {
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendTransaction: (to: string, amount: number) => Promise<void>;
  updateTransactionStatus: (txId: string, status: Transaction['status']) => void;
  updateBalance: (newBalance?: string) => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  address: null,
  isConnected: false,
  transactions: [],
  isLoading: false,
  error: null,
  balance: '0.0',

  updateBalance: async (newBalance?: string) => {
    try {
      if (newBalance) {
        set({ balance: newBalance });
      } else {
        // Mock balance update - in real app, this would call web3Service
        const mockBalance = (Math.random() * 10).toFixed(4);
        set({ balance: mockBalance });
      }
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  },

  connect: async () => {
    try {
      set({ isLoading: true, error: null });
      const address = await web3Service.connectWallet();
      set({ address, isConnected: true });
      // Update balance after connecting
      await get().updateBalance();
      toast.success('Wallet connected successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage });
      toast.error(`Failed to connect wallet: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  disconnect: () => {
    try {
      web3Service.disconnectWallet();
      set({ address: null, isConnected: false, transactions: [], balance: '0.0' });
      toast.info('Wallet disconnected', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast.error(`Error disconnecting wallet: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  },

  sendTransaction: async (to: string, amount: number) => {
    try {
      set({ isLoading: true, error: null });
      
      // Validate inputs
      if (!to.startsWith('0x') || to.length !== 42) {
        throw new Error('Invalid Ethereum address format');
      }
      
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Check if we have enough balance
      const currentBalance = parseFloat(get().balance);
      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }

      const txId = await web3Service.sendTransaction(to, amount);
      
      const newTransaction: Transaction = {
        id: txId,
        status: 'Pending',
        timestamp: Date.now(),
        to,
        amount,
        hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      };

      set(state => ({
        transactions: [newTransaction, ...state.transactions].slice(0, 5)
      }));

      toast.info(`Transaction initiated: ${txId.slice(0, 6)}...${txId.slice(-4)}`, {
        position: 'top-right',
        autoClose: 3000,
      });

      // Simulate random transaction result after 3 seconds
      setTimeout(async () => {
        const success = Math.random() > 0.3;
        get().updateTransactionStatus(txId, success ? 'Success' : 'Failed');
        if (success) {
          // Update balance by subtracting the sent amount
          const newBalance = (currentBalance - amount).toFixed(4);
          await get().updateBalance(newBalance);
        }
        toast[success ? 'success' : 'error'](
          `Transaction ${txId.slice(0, 6)}...${txId.slice(-4)} ${success ? 'completed' : 'failed'}`,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
      }, 3000);

    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage });
      toast.error(`Transaction failed: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransactionStatus: (txId: string, status: Transaction['status']) => {
    set(state => ({
      transactions: state.transactions.map(tx =>
        tx.id === txId ? { ...tx, status } : tx
      )
    }));
  }
})); 