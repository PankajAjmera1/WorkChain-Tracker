import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { ActivitySnapshot, DailySummary, EncryptedData } from './types';

/**
 * SQLite database manager for WorkChain tracker using sql.js (pure JavaScript)
 * Stores encrypted activity logs, screenshot hashes, and daily summaries
 */
export class WorkDatabase {
    private db: SqlJsDatabase | null = null;
    private dbPath: string;
    private initialized = false;

    constructor() {
        this.dbPath = path.join(app.getPath('userData'), 'workchain.db');
        console.log(`[Database] Will initialize database at: ${this.dbPath}`);
    }

    /**
     * Initialize the database (async)
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        const SQL = await initSqlJs();

        // Load existing database if it exists
        if (fs.existsSync(this.dbPath)) {
            const buffer = fs.readFileSync(this.dbPath);
            this.db = new SQL.Database(buffer);
            console.log('[Database] Loaded existing database');
        } else {
            this.db = new SQL.Database();
            console.log('[Database] Created new database');
        }

        // Create tables
        this.db.run(`
      CREATE TABLE IF NOT EXISTS activity_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        window_title_hash TEXT NOT NULL,
        app_name TEXT NOT NULL,
        app_category TEXT NOT NULL,
        is_active INTEGER NOT NULL,
        encrypted_data TEXT,
        iv TEXT,
        tag TEXT
      );

      CREATE TABLE IF NOT EXISTS screenshot_hashes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        total_active_minutes INTEGER DEFAULT 0,
        coding_minutes INTEGER DEFAULT 0,
        meeting_minutes INTEGER DEFAULT 0,
        browser_minutes INTEGER DEFAULT 0,
        communication_minutes INTEGER DEFAULT 0,
        productivity_minutes INTEGER DEFAULT 0,
        merkle_root TEXT,
        submitted_to_chain INTEGER DEFAULT 0,
        shelby_blob_id TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_timestamp ON activity_snapshots(timestamp);
      CREATE INDEX IF NOT EXISTS idx_screenshot_timestamp ON screenshot_hashes(timestamp);
      CREATE INDEX IF NOT EXISTS idx_date ON daily_summaries(date);
      CREATE INDEX IF NOT EXISTS idx_shelby_blob ON daily_summaries(shelby_blob_id);
    `);

        // Migration: Add shelby_blob_id column if it doesn't exist
        try {
            this.db.run('ALTER TABLE daily_summaries ADD COLUMN shelby_blob_id TEXT');
            console.log('[Database] Added shelby_blob_id column (migration)');
        } catch (error) {
            // Column already exists, ignore error
        }

        this.initialized = true;
        this.save();
        console.log('[Database] Ready');
    }

    /**
     * Save database to disk
     */
    private save(): void {
        if (!this.db) return;

        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(this.dbPath, buffer);
    }

    /**
     * Insert activity snapshot with encrypted data
     */
    insertActivity(snapshot: ActivitySnapshot, encryptedData: EncryptedData): void {
        if (!this.db) throw new Error('Database not initialized');

        this.db.run(
            `INSERT INTO activity_snapshots 
      (timestamp, window_title_hash, app_name, app_category, is_active, encrypted_data, iv, tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                snapshot.timestamp,
                snapshot.windowTitleHash,
                snapshot.appName,
                snapshot.appCategory,
                snapshot.isActive ? 1 : 0,
                encryptedData.encrypted,
                encryptedData.iv,
                encryptedData.tag
            ]
        );

        this.save();
    }

    /**
     * Insert screenshot hash
     */
    insertScreenshotHash(hash: string, timestamp: number): void {
        if (!this.db) throw new Error('Database not initialized');

        this.db.run(
            `INSERT INTO screenshot_hashes (timestamp, hash) VALUES (?, ?)`,
            [timestamp, hash]
        );

        this.save();
    }

    /**
     * Get daily summary for a specific date
     */
    getDailySummary(date: string): DailySummary | null {
        if (!this.db) throw new Error('Database not initialized');

        const result = this.db.exec(
            `SELECT * FROM daily_summaries WHERE date = ?`,
            [date]
        );

        if (result.length === 0 || result[0].values.length === 0) {
            return null;
        }

        const row = result[0].values[0];
        const columns = result[0].columns;

        return {
            date: row[columns.indexOf('date')] as string,
            totalActiveMinutes: row[columns.indexOf('total_active_minutes')] as number,
            codingMinutes: row[columns.indexOf('coding_minutes')] as number,
            meetingMinutes: row[columns.indexOf('meeting_minutes')] as number,
            browserMinutes: row[columns.indexOf('browser_minutes')] as number,
            communicationMinutes: row[columns.indexOf('communication_minutes')] as number,
            productivityMinutes: row[columns.indexOf('productivity_minutes')] as number,
            merkleRoot: row[columns.indexOf('merkle_root')] as string | undefined,
            submittedToChain: row[columns.indexOf('submitted_to_chain')] === 1,
            shelbyBlobId: row[columns.indexOf('shelby_blob_id')] as string | undefined
        };
    }

    /**
     * Update or create daily summary
     */
    updateDailySummary(date: string, summary: Partial<DailySummary>): void {
        if (!this.db) throw new Error('Database not initialized');

        this.db.run(
            `INSERT INTO daily_summaries 
      (date, total_active_minutes, coding_minutes, meeting_minutes, browser_minutes, communication_minutes, productivity_minutes, shelby_blob_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        total_active_minutes = excluded.total_active_minutes,
        coding_minutes = excluded.coding_minutes,
        meeting_minutes = excluded.meeting_minutes,
        browser_minutes = excluded.browser_minutes,
        communication_minutes = excluded.communication_minutes,
        productivity_minutes = excluded.productivity_minutes,
        shelby_blob_id = excluded.shelby_blob_id`,
            [
                date,
                summary.totalActiveMinutes || 0,
                summary.codingMinutes || 0,
                summary.meetingMinutes || 0,
                summary.browserMinutes || 0,
                summary.communicationMinutes || 0,
                summary.productivityMinutes || 0,
                summary.shelbyBlobId || null
            ]
        );

        this.save();
    }

    /**
     * Get all screenshot hashes for a date
     */
    getScreenshotHashesForDate(date: string): Array<{ hash: string; timestamp: number }> {
        if (!this.db) throw new Error('Database not initialized');

        const startOfDay = new Date(date).setHours(0, 0, 0, 0);
        const endOfDay = new Date(date).setHours(23, 59, 59, 999);

        const result = this.db.exec(
            `SELECT hash, timestamp FROM screenshot_hashes
      WHERE timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp ASC`,
            [startOfDay, endOfDay]
        );

        if (result.length === 0) {
            return [];
        }

        return result[0].values.map(row => ({
            hash: row[0] as string,
            timestamp: row[1] as number
        }));
    }

    /**
     * Get activity count for today
     */
    getTodayActivityCount(): number {
        if (!this.db) throw new Error('Database not initialized');

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        const startOfDay = new Date(today).setHours(0, 0, 0, 0);

        const result = this.db.exec(
            `SELECT COUNT(*) as count FROM activity_snapshots WHERE timestamp >= ?`,
            [startOfDay]
        );

        if (result.length === 0 || result[0].values.length === 0) {
            return 0;
        }

        return result[0].values[0][0] as number;
    }

    /**
     * Get recent daily summaries
     */
    getRecentSummaries(limit: number = 7): DailySummary[] {
        if (!this.db) throw new Error('Database not initialized');

        const result = this.db.exec(
            `SELECT * FROM daily_summaries ORDER BY date DESC LIMIT ?`,
            [limit]
        );

        if (result.length === 0 || result[0].values.length === 0) {
            return [];
        }

        const columns = result[0].columns;
        return result[0].values.map(row => ({
            date: row[columns.indexOf('date')] as string,
            totalActiveMinutes: row[columns.indexOf('total_active_minutes')] as number,
            codingMinutes: row[columns.indexOf('coding_minutes')] as number,
            meetingMinutes: row[columns.indexOf('meeting_minutes')] as number,
            browserMinutes: row[columns.indexOf('browser_minutes')] as number,
            communicationMinutes: row[columns.indexOf('communication_minutes')] as number,
            productivityMinutes: row[columns.indexOf('productivity_minutes')] as number,
            merkleRoot: row[columns.indexOf('merkle_root')] as string | undefined,
            submittedToChain: row[columns.indexOf('submitted_to_chain')] === 1,
            shelbyBlobId: row[columns.indexOf('shelby_blob_id')] as string | undefined
        }));
    }

    /**
     * Close database connection
     */
    close(): void {
        if (this.db) {
            this.save();
            this.db.close();
            this.db = null;
            console.log('[Database] Closed');
        }
    }
}
