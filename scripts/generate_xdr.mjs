/**
 * Generates a random testnet transaction XDR.
 * Useful for manual testing or verifying XDR parsing.
 */
import { webcrypto } from 'crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
import { TransactionBuilder, Networks, Keypair, Account } from '@stellar/stellar-sdk';
const tx = new TransactionBuilder(new Account(Keypair.random().publicKey(), '1'), {fee: '100', networkPassphrase: Networks.TESTNET}).setTimeout(0).build();
console.log(tx.toEnvelope().toXDR('base64'));
