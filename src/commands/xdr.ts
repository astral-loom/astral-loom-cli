import { Command } from 'commander';
import { xdr } from '@stellar/stellar-sdk';

export const xdrCommand = new Command('xdr')
  .description('Utilities for working with XDR');

xdrCommand
  .command('decode')
  .description('Pretty-print an XDR string (TransactionEnvelope)')
  .argument('<xdrString>', 'Base64 encoded XDR string')
  .action((xdrString: string) => {
    try {
      const envelope = xdr.TransactionEnvelope.fromXDR(xdrString, 'base64');
      // Fix BigInt JSON serialization error
      console.log(JSON.stringify(envelope, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      , 2));
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Failed to decode XDR as TransactionEnvelope:', err.message || err);
    }
  });
