import { Web3Service } from '../types/wallet';

class MockWeb3Service implements Web3Service {
  async connectWallet(): Promise<string> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  }

  async sendTransaction(to: string, amount: number): Promise<string> {
    // Validate inputs
    if (!to || amount <= 0) {
      throw new Error('Invalid transaction parameters');
    }

    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate random transaction hash
    const txHash = '0x' + Math.random().toString(16).substr(2, 40);
    return txHash;
  }

  disconnectWallet(): void {
    // Simulate disconnect
  }
}

export const web3Service = new MockWeb3Service(); 