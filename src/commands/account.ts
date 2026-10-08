import { Command } from 'commander';
import fetch from 'node-fetch';
import { Keypair } from '@stellar/stellar-sdk';

export const accountCommand = new Command('account')
  .description('Manage Stellar accounts');

accountCommand
  .command('create')
  .description('Create and fund a new testnet account')
  .option('--reveal-secret', 'Print the secret key instead of masking it')
  .action(async (options) => {
    try {
      console.log('Generating new keypair...');
      const pair = Keypair.random();
      const publicKey = pair.publicKey();
      const secret = pair.secret();

      console.log(`Public Key: ${publicKey}`);
      if (options.revealSecret) {
        console.log(`Secret Key: ${secret}`);
        console.log('⚠️  Anyone with this secret key controls the account. Never share it or commit it.');
      } else {
        console.log('Secret Key: [hidden]  Pass --reveal-secret to print it.');
      }
      console.log('\nFunding account on Testnet via Friendbot...');

      const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
      
      if (response.ok) {
        console.log('SUCCESS! Account funded successfully.');
      } else {
        const errorData = await response.json() as { detail?: string };
        console.error('FAILED! Friendbot responded with an error:', errorData.detail || errorData);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creating account:', err.message || err);
    }
  });
