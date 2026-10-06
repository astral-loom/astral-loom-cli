import { Command } from 'commander';
import { rpc, Contract, Account, nativeToScVal } from '@stellar/stellar-sdk';
import { Networks } from '@stellar/stellar-sdk';

export const sorobanInvokeCommand = new Command('soroban-invoke')
  .description('Simulate a Soroban smart contract invocation')
  .argument('<contractId>', 'Contract ID')
  .argument('<method>', 'Method name')
  .argument('[args...]', 'Arguments as JSON strings')
  .option('-n, --network <network>', 'Network to use (testnet, futurenet, mainnet)', 'testnet')
  .action(async (contractId, method, args, options) => {
    try {
      let url = 'https://soroban-rpc.testnet.stellar.org';
      let networkPassphrase = Networks.TESTNET;
      
      if (options.network === 'mainnet') {
        url = 'https://soroban-rpc.mainnet.stellar.org';
        networkPassphrase = Networks.PUBLIC;
      } else if (options.network === 'futurenet') {
        url = 'https://rpc-futurenet.stellar.org';
        networkPassphrase = 'Test SDF Future Network ; Fall 2022';
      }

      const server = new rpc.Server(url);
      const contract = new Contract(contractId);
      
      // Parse arguments
      const scValArgs = args.map((argStr: string) => {
        try {
          const val = JSON.parse(argStr);
          return nativeToScVal(val);
        } catch (e) {
          // If not valid JSON, treat as string
          return nativeToScVal(argStr);
        }
      });
      
      console.log(`Simulating ${method} on contract ${contractId}...`);
      
      const account = new Account('GA6L7D63QJYYZBYCDBYQYJ4XN2O4S7JFYR53UKN673F6N5B2F5C6Y47X', '0');
      const tx = new (require('@stellar/stellar-sdk').TransactionBuilder)(account, {
        fee: '100',
        networkPassphrase,
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

    } catch (error: any) {
      console.error('❌ Error:', error.message || String(error));
    }
  });
