import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import * as fs from 'fs';
import * as path from 'path';

async function deployContract() {
    try {
        console.log('🚀 Deploying WorkChain Smart Contract...\n');

        // Initialize Aptos client
        const config = new AptosConfig({
            network: Network.TESTNET,
            clientConfig: {
                API_KEY: "aptoslabs_88ixHdJVHMn_BHf18YaJQEfy9jLfquNeVs8F8CsfeT5Zf"
            }
        });
        const aptos = new Aptos(config);

        // Your account
        const privateKey = new Ed25519PrivateKey('0xa96ede1f5a01f881294a7bee9fec8152d0c3fcc8328d48843732f643cf9f0827');
        const account = Account.fromPrivateKey({ privateKey });

        console.log(`📍 Deploying from: ${account.accountAddress.toString()}`);

        // Read compiled module
        const modulePath = path.join(process.cwd(), 'build/WorkProof/bytecode_modules/work_proof.mv');

        if (!fs.existsSync(modulePath)) {
            console.error('❌ Module not found. Please compile first:');
            console.log('   aptos move compile');
            process.exit(1);
        }

        const moduleBytes = fs.readFileSync(modulePath);
        console.log(`📦 Module size: ${moduleBytes.length} bytes`);

        // Get ledger info to handle clock skew
        const ledgerInfo = await aptos.getLedgerInfo();
        const ledgerTimestampMicros = BigInt(ledgerInfo.ledger_timestamp);
        const ledgerTimestampSeconds = Number(ledgerTimestampMicros / BigInt(1000000));
        const expireTimestamp = Math.floor(ledgerTimestampSeconds + 3600); // Add 1 hour buffer

        console.log(`🕒 Ledger timestamp (s): ${ledgerTimestampSeconds}`);
        console.log(`🕒 Expiration set to (s): ${expireTimestamp}`);

        // Build publish transaction
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: '0x1::code::publish_package_txn',
                functionArguments: [
                    moduleBytes,
                    [] // No dependencies
                ]
            },
            options: {
                expireTimestamp: expireTimestamp
            }
        });

        console.log('\n⏳ Submitting transaction...');

        // Sign and submit
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction
        });

        console.log(`📝 Transaction hash: ${committedTxn.hash}`);
        console.log('⏳ Waiting for confirmation...');

        // Wait for transaction
        const executedTransaction = await aptos.waitForTransaction({
            transactionHash: committedTxn.hash
        });

        console.log('\n✅ Contract deployed successfully!');
        console.log(`🔗 View on explorer: https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet`);
        console.log(`\n📍 Contract address: ${account.accountAddress.toString()}`);

        console.log('\n🎉 Next steps:');
        console.log('1. Initialize reward pool:');
        console.log(`   aptos move run --function-id ${account.accountAddress}::work_proof::initialize_reward_pool --args u64:100000000000`);
        console.log('\n2. Initialize leaderboard:');
        console.log(`   aptos move run --function-id ${account.accountAddress}::work_proof::initialize_leaderboard`);

    } catch (error: any) {
        console.error('\n❌ Deployment failed:', error.message);
        if (error.transaction) {
            console.error('Transaction details:', error.transaction);
        }
        process.exit(1);
    }
}

deployContract();
