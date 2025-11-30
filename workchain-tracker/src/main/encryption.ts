import crypto from 'crypto';
import { machineIdSync } from 'node-machine-id';
import { EncryptedData } from './types';

/**
 * Handles AES-256-GCM encryption for sensitive data
 * Uses machine ID as part of the encryption key for device-specific encryption
 */
export class Encryptor {
    private key: Buffer;
    private readonly ALGORITHM = 'aes-256-gcm';

    constructor() {
        try {
            // Use machine ID as part of encryption key (device-specific)
            const machineId = machineIdSync();
            this.key = crypto.scryptSync(machineId, 'workchain-salt-2025', 32);
            console.log('[Encryptor] Initialized with machine-specific key');
        } catch (error) {
            console.error('[Encryptor] Failed to get machine ID, using fallback');
            // Fallback to random key (less secure but works)
            this.key = crypto.randomBytes(32);
        }
    }

    /**
     * Encrypt data using AES-256-GCM
     * @param data String data to encrypt
     * @returns Encrypted data with IV and auth tag
     */
    encrypt(data: string): EncryptedData {
        try {
            // Generate random initialization vector
            const iv = crypto.randomBytes(16);

            // Create cipher
            const cipher = crypto.createCipheriv(this.ALGORITHM, this.key, iv);

            // Encrypt data
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Get authentication tag
            const tag = cipher.getAuthTag();

            return {
                encrypted,
                iv: iv.toString('hex'),
                tag: tag.toString('hex')
            };
        } catch (error) {
            console.error('[Encryptor] Encryption failed:', error);
            throw error;
        }
    }

    /**
     * Decrypt data using AES-256-GCM
     * @param encrypted Encrypted data
     * @param iv Initialization vector (hex)
     * @param tag Authentication tag (hex)
     * @returns Decrypted string
     */
    decrypt(encrypted: string, iv: string, tag: string): string {
        try {
            // Create decipher
            const decipher = crypto.createDecipheriv(
                this.ALGORITHM,
                this.key,
                Buffer.from(iv, 'hex')
            );

            // Set authentication tag
            decipher.setAuthTag(Buffer.from(tag, 'hex'));

            // Decrypt data
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('[Encryptor] Decryption failed:', error);
            throw error;
        }
    }

    /**
     * Test encryption/decryption
     */
    test(): boolean {
        try {
            const testData = 'Hello, WorkChain!';
            const encrypted = this.encrypt(testData);
            const decrypted = this.decrypt(encrypted.encrypted, encrypted.iv, encrypted.tag);
            return testData === decrypted;
        } catch {
            return false;
        }
    }
}
