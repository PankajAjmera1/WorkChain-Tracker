import { Encryptor } from './encryption';
import { ActivitySnapshot, DailySummary } from './types';

/**
 * Shelby Protocol service for decentralized storage
 * Currently using mock blob IDs until Shelby SDK is properly configured
 */
export class ShelbyService {
    private encryptor: Encryptor;
    private blobIdCache: Map<string, string> = new Map();
    private apiKey = 'AG-9MPVHVGPW8VHBDYETRXWVMX3QNTFXF7TZ';
    private accountAddress = '0x745fe21b1f69dcb88e325f4fc3f3a3a0bd4bfbb03e62aabbb34b7be305fd9365';
    private shelbyApiUrl = 'https://api.shelbynet.shelby.xyz/v1';

    constructor() {
        this.encryptor = new Encryptor();
        console.log('[ShelbyService] ✅ Initialized');
        console.log(`[ShelbyService] Account: ${this.accountAddress}`);
        console.log(`[ShelbyService] API: ${this.shelbyApiUrl}`);
        console.log(`[ShelbyService] Mode: Mock (Shelby SDK integration pending)`);
    }

    /**
     * Upload encrypted daily summary to Shelby Protocol
     * @returns Blob ID for retrieval
     */
    async uploadDailySummary(summary: DailySummary): Promise<string> {
        try {
            // Encrypt the summary data
            const encryptedData = this.encryptor.encrypt(JSON.stringify(summary));
            const dataString = JSON.stringify(encryptedData);
            
            // Convert to Buffer
            const buffer = Buffer.from(dataString, 'utf-8');

            // Generate unique blob ID (mock for now)
            const blobId = `shelby_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Cache the blob ID
            this.blobIdCache.set(`summary_${summary.date}`, blobId);

            console.log(`[ShelbyService] ✅ Generated blob ID: ${blobId}`);
            console.log(`[ShelbyService] Encrypted size: ${buffer.length} bytes`);
            console.log(`[ShelbyService] Account: ${this.accountAddress}`);
            
            return blobId;
        } catch (error) {
            console.error('[ShelbyService] Upload failed:', error);
            const fallbackId = `shelby_error_${Date.now()}`;
            return fallbackId;
        }
    }

    /**
     * Download and decrypt daily summary from Shelby Protocol
     */
    async downloadDailySummary(blobId: string): Promise<DailySummary> {
        throw new Error('Download not implemented - Shelby SDK integration pending');
    }

    /**
     * Get cached blob ID
     */
    getCachedBlobId(key: string): string | undefined {
        return this.blobIdCache.get(key);
    }

    /**
     * Clear blob ID cache
     */
    clearCache(): void {
        this.blobIdCache.clear();
        console.log('[ShelbyService] Cache cleared');
    }
}
