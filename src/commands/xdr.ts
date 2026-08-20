import { Command } from 'commander';
import { xdr } from '@stellar/stellar-sdk';

export const decodeXdrCommand = new Command('xdr')
  .description('Utilities for working with XDR')
  .command('decode')
  .description('Pretty-print an XDR string (TransactionEnvelope)')
  .argument('<xdrString>', 'Base64 encoded XDR string')
  .action((xdrString: string) => {
    try {
      const envelope = xdr.TransactionEnvelope.fromXDR(xdrString, 'base64');
      console.log(JSON.stringify(envelope, null, 2));
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Failed to decode XDR as TransactionEnvelope:', err.message || err);
    }
  });
