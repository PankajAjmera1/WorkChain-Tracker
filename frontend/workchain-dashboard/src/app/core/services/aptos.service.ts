import { Injectable, signal } from '@angular/core';
import { Aptos, AptosConfig, Network, Account, AccountAddress, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

@Injectable({
    providedIn: 'root'
})
export class AptosService {
    private aptos: Aptos;
    private account = signal<Account | null>(null);

    // Contract address (Testnet deployment)
    readonly MODULE_ADDRESS = '0x745fe21b1f69dcb88e325f4fc3f3a3a0bd4bfbb03e62aabbb34b7be305fd9365';
    readonly MODULE_NAME = 'proof_of_work';

    // Public signals for components
    isConnected = signal(false);
    address = signal<string | null>(null);
    balance = signal<string>('0');

    constructor() {
        // Setup Aptos client for Testnet
        const config = new AptosConfig({ network: Network.TESTNET });
        this.aptos = new Aptos(config);
    }

    /**
     * Connect to a wallet (Simulated for now using a local account)
     * In a real dApp, we would use the Aptos Wallet Adapter
     */
    async connectWallet() {
        try {
            // Use the funded account private key
            const privateKey = new Ed25519PrivateKey("0xa96ede1f5a01f881294a7bee9fec8152d0c3fcc8328d48843732f643cf9f0827");
            const activeAccount = Account.fromPrivateKey({ privateKey });

            this.account.set(activeAccount);
            this.address.set(activeAccount.accountAddress.toString());
            this.isConnected.set(true);

            await this.refreshBalance();

            return true;
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            return false;
        }
    }

    async fundAccount(address: AccountAddress) {
        try {
            console.log('Funding account...', address.toString());
            await this.aptos.fundAccount({
                accountAddress: address,
                amount: 100_000_000, // 1 APT
            });
            console.log('Account funded!');
        } catch (e) {
            console.error('Faucet failed (might be rate limited):', e);
        }
    }

    async refreshBalance() {
        if (!this.account()) return;

        try {
            const resources = await this.aptos.getAccountCoinAmount({
                accountAddress: this.account()!.accountAddress,
                coinType: "0x1::aptos_coin::AptosCoin",
            });

            // Convert Octas to APT
            const apt = (resources / 100_000_000).toFixed(2);
            this.balance.set(apt);
        } catch (error) {
            console.error('Error fetching balance:', error);
            this.balance.set('0');
        }
    }

    /**
     * Submit proof of work transaction
     */
    /**
     * Submit proof of work transaction
     */
    async submitProof(appName: string, windowTitle: string, durationSeconds: number, timestamp: number, hash: string) {
        if (!this.account()) throw new Error('Wallet not connected');

        try {
            console.log(`Submitting proof: ${appName} - ${windowTitle}, ${durationSeconds}s, hash: ${hash}`);

            const transaction = await this.aptos.transaction.build.simple({
                sender: this.account()!.accountAddress,
                data: {
                    function: `${this.MODULE_ADDRESS}::${this.MODULE_NAME}::submit_proof`,
                    functionArguments: [appName, windowTitle, durationSeconds, timestamp, hash],
                },
            });

            const pendingTxn = await this.aptos.signAndSubmitTransaction({
                signer: this.account()!,
                transaction,
            });

            const response = await this.aptos.waitForTransaction({
                transactionHash: pendingTxn.hash,
            });

            console.log('✅ Proof submitted successfully!', response);
            return response;
        } catch (error) {
            console.error('Failed to submit proof:', error);
            throw error;
        }
    }
}
