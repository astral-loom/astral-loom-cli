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
          assetCode = ('asset_code' in balance ? balance.asset_code : undefined) || 'UNKNOWN';
        }
        
        let limit = 'Unlimited';
        if ('limit' in balance && balance.limit) {
          limit = balance.limit;
        }

        table.push([
          assetCode,
          balance.balance,
          limit
        ]);
      });

      console.log(table.toString());
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error fetching balance:', err.message);
    }
  });
