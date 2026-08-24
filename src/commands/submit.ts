import { Command } from 'commander';
import { Horizon, TransactionBuilder, Networks } from '@stellar/stellar-sdk';

export const submitCommand = new Command('submit')
  .description('Submit a signed transaction envelope (XDR) to the network')
  .argument('<xdr>', 'Base64 encoded signed transaction XDR')
  .option('-n, --network <network>', 'Network to use (testnet or mainnet)', 'testnet')
  .action(async (xdr, options) => {
    try {
      const serverUrl = options.network === 'mainnet' 
        ? 'https://horizon.stellar.org' 
        : 'https://horizon-testnet.stellar.org';
        
      const networkPassphrase = options.network === 'mainnet'
        ? Networks.PUBLIC
        : Networks.TESTNET;
        
      const server = new Horizon.Server(serverUrl);
      
      console.log(`Submitting transaction to ${options.network}...\n`);
      
      // Parse the transaction from XDR
      const transaction = TransactionBuilder.fromXDR(xdr, networkPassphrase);
      
      // Submit the transaction
      // @ts-ignore - submitTransaction accepts a Transaction or FeeBumpTransaction
      const response = await server.submitTransaction(transaction);
      
      console.log('✅ Transaction submitted successfully!\n');
      console.log(`Hash: ${response.hash}`);
      if (response.ledger) {
        console.log(`Ledger: ${response.ledger}`);
      }
      
      const explorerUrl = options.network === 'mainnet'
        ? `https://stellar.expert/explorer/public/tx/${response.hash}`
        : `https://stellar.expert/explorer/testnet/tx/${response.hash}`;
        
      console.log(`Explorer: ${explorerUrl}`);
      
    } catch (error: any) {
      console.error('❌ Error submitting transaction:');
      if (error.response?.data?.extras?.result_codes) {
        console.error('Result Codes:', error.response.data.extras.result_codes);
      } else {
        console.error(error.response?.data?.detail || error.message || error);
      }
    }
  });
