/**
 * Core type definitions for WorkChain Tracker
 */

export interface ActivitySnapshot {
    timestamp: number;
    windowTitleHash: string;
    appName: string;
    appCategory: AppCategory;
    isActive: boolean;
}

export enum AppCategory {
    CODING = 'coding',
    MEETING = 'meeting',
    BROWSER = 'browser',
    COMMUNICATION = 'communication',
    PRODUCTIVITY = 'productivity',
    OTHER = 'other'
}

export interface EncryptedData {
    encrypted: string;
    iv: string;
    tag: string;
}

export interface DailySummary {
    date: string;
    totalActiveMinutes: number;
    codingMinutes: number;
    meetingMinutes: number;
    browserMinutes: number;
    communicationMinutes: number;
    productivityMinutes: number;
    merkleRoot?: string;
    submittedToChain: boolean;
    shelbyBlobId?: string;
}

export interface TrackerStatus {
    isTracking: boolean;
    todaySummary: DailySummary | null;
    lastScreenshotHash?: string;
    lastActivityTime?: number;
}
