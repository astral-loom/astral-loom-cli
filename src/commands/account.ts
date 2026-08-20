import { Command } from 'commander';
import fetch from 'node-fetch';
import { Keypair } from '@stellar/stellar-sdk';

export const createAccountCommand = new Command('account')
  .description('Manage Stellar accounts')
  .command('create')
  .description('Create and fund a new testnet account')
  .action(async () => {
    try {
      console.log('Generating new keypair...');
      const pair = Keypair.random();
      const publicKey = pair.publicKey();
      const secret = pair.secret();

      console.log(`Public Key: ${publicKey}`);
      console.log(`Secret Key: ${secret}`);
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
