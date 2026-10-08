import { Command } from 'commander';
import { rpc, Contract, TransactionBuilder, Account, Networks, nativeToScVal } from '@stellar/stellar-sdk';

// Account with the all-1s (max) sequence number. Soroban simulation only needs a
// valid, well-formed source account, and the infinite sequence avoids forcing users
// to look up their real sequence just to dry-run a call.
const SIMULATION_SOURCE_ACCOUNT = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

const NETWORKS: Record<string, { rpcUrl: string; networkPassphrase: string }> = {
  testnet: {
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: Networks.TESTNET,
  },
  mainnet: {
    rpcUrl: 'https://mainnet.stellar.googleapis.com',
    networkPassphrase: Networks.PUBLIC,
  },
};

export const sorobanInvokeCommand = new Command('soroban-invoke')
  .description('Simulate a Soroban smart contract invocation')
  .argument('<contractId>', 'Contract ID')
  .argument('<method>', 'Method name')
  .argument('[args...]', 'Arguments as JSON strings')
  .option('-n, --network <network>', 'Network to use (testnet, mainnet)', 'testnet')
  .option('-s, --source <address>', 'Source account address used for simulation', SIMULATION_SOURCE_ACCOUNT)
  .action(async (contractId, method, args, options) => {
    try {
      const network = NETWORKS[options.network];
      if (!network) {
        console.error(`❌ Unknown network "${options.network}". Use: ${Object.keys(NETWORKS).join(', ')}`);
        process.exitCode = 1;
        return;
      }

      const server = new rpc.Server(network.rpcUrl);
      const contract = new Contract(contractId);
      
      // Parse arguments
      const scValArgs = args.map((argStr: string) => {
        try {
          const val = JSON.parse(argStr);
          return nativeToScVal(val);
        } catch {
          // If not valid JSON, treat as string
          return nativeToScVal(argStr);
        }
      });
      
      console.log(`Simulating ${method} on contract ${contractId} (${options.network})...`);
      
      const account = new Account(options.source, '0');
      const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: network.networkPassphrase,
      })
      .addOperation(contract.call(method, ...scValArgs))
      .setTimeout(30)
      .build();

      const simResult = await server.simulateTransaction(tx);
      
      if (rpc.Api.isSimulationError(simResult)) {
        console.error('❌ Simulation Error:', simResult.error);
        return;
      }
      
      if (rpc.Api.isSimulationSuccess(simResult)) {
        console.log('✅ Simulation Success!');
        console.log('Cost:', simResult.cost);
        if (simResult.result && simResult.result.retval) {
           console.log('Return Value:', JSON.stringify(simResult.result.retval, null, 2));
        }
      } else {
        console.error('❌ Simulation failed or incomplete');
      }

    } catch (error: unknown) {
      console.error('❌ Error:', (error as Error).message || String(error));
    }
  });
