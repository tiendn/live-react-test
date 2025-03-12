export type TransactionStatus = 'Pending' | 'Success' | 'Failed';

export interface Transaction {
  id: string;
  status: TransactionStatus;
  timestamp: number;
  to: string;
  amount: number;
  hash: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

// Mock Web3 Service Types
export interface Web3Service {
  connectWallet: () => Promise<string>;
  sendTransaction: (to: string, amount: number) => Promise<string>;
  disconnectWallet: () => void;
} 