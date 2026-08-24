import { Command } from 'commander';
import { Horizon } from '@stellar/stellar-sdk';
import Table from 'cli-table3';

export const balanceCommand = new Command('balance')
  .description('Check account balances and trustlines')
  .argument('<publicKey>', 'Public key of the account')
  .option('-n, --network <network>', 'Network to use (testnet or mainnet)', 'testnet')
  .action(async (publicKey, options) => {
    try {
      const serverUrl = options.network === 'mainnet' 
        ? 'https://horizon.stellar.org' 
        : 'https://horizon-testnet.stellar.org';
        
      const server = new Horizon.Server(serverUrl);
      
      console.log(`Querying ${options.network} for account: ${publicKey}\n`);
      
      const account = await server.accounts().accountId(publicKey).call();
      
      const table = new Table({
        head: ['Asset Code', 'Balance', 'Limit'],
        style: { head: ['cyan'] }
      });

      account.balances.forEach((balance) => {
        let assetCode = 'XLM';
        if (balance.asset_type !== 'native') {
          // @ts-ignore
          assetCode = balance.asset_code || 'UNKNOWN';
        }
        
        let limit = 'Unlimited';
        // @ts-ignore
        if (balance.limit) {
          // @ts-ignore
          limit = balance.limit;
        }

        table.push([
          assetCode,
          balance.balance,
          limit
        ]);
      });

      console.log(table.toString());
      
    } catch (error: any) {
      console.error('Error fetching balance:', error.response?.data?.detail || error.message || error);
    }
  });
