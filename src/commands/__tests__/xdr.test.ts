import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { decodeXdrCommand, xdrCommand } from '../xdr.js';
import {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';

function signedTestnetEnvelope(): string {
  const source = new Account(Keypair.random().publicKey(), '1');
  const payment = Operation.payment({
    destination: Keypair.random().publicKey(),
    asset: new Asset('USD', Keypair.random().publicKey()),
    amount: '12.5000000',
  });
  const tx = new TransactionBuilder(source, { fee: '100', networkPassphrase: Networks.TESTNET })
    .addOperation(payment)
    .setTimeout(30)
    .build();
  tx.sign(Keypair.random());
  return tx.toXDR();
}

describe('XDR Command', () => {
  it('should have correct name', () => {
    expect(decodeXdrCommand.name()).toBe('decode');
  });

  it('is registered as the xdr command', () => {
    expect(xdrCommand.name()).toBe('xdr');
  });
});

describe('xdr decode action', () => {
  let captured: ReturnType<typeof setupSpies>;

  function setupSpies() {
    const logs: unknown[][] = [];
    const errs: unknown[][] = [];
    const log = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      logs.push(args);
    });
    const error = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errs.push(args);
    });
    return {
      errs,
      firstLog: () => String(logs[0]?.[0] ?? ''),
      errText: () => errs.map((args) => args.map(String).join(' ')).join('\n'),
      restore: () => {
        log.mockRestore();
        error.mockRestore();
      },
    };
  }

  beforeEach(() => {
    captured = setupSpies();
  });

  afterEach(() => {
    captured.restore();
  });

  it('pretty-prints a transaction envelope as readable JSON', async () => {
    const envelope = signedTestnetEnvelope();

    await xdrCommand.parseAsync(['decode', envelope], { from: 'user' });

    const printed = captured.firstLog();
    const parsed = JSON.parse(printed) as Record<string, unknown>;
    expect(Object.keys(parsed)).toEqual(['tx']);
    expect(printed).toContain('\n  "tx"');
  });

  it('reports the decoder failure instead of crashing the CLI', async () => {
    await xdrCommand.parseAsync(['decode', 'not-a-valid-envelope'], { from: 'user' });

    expect(captured.errText()).toContain('Failed to decode XDR as TransactionEnvelope:');
  });

  it('falls back to the raw thrown value when the error carries no message', async () => {
    const spy = vi
      .spyOn(xdr.TransactionEnvelope, 'fromXDR')
      .mockImplementation(() => {
        throw new Error('');
      });

    await xdrCommand.parseAsync(['decode', 'whatever'], { from: 'user' });

    spy.mockRestore();
    expect(captured.errText()).toContain('Failed to decode XDR as TransactionEnvelope: Error');
  });
});
