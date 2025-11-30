export enum AppCategory {
    CODING = 'coding',
    MEETING = 'meeting',
    BROWSER = 'browser',
    COMMUNICATION = 'communication',
    PRODUCTIVITY = 'productivity',
    OTHER = 'other'
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
}

export interface TrackerStatus {
    isTracking: boolean;
    todaySummary: DailySummary | null;
    lastScreenshotHash?: string;
    lastActivityTime: number;
}

export interface CategoryStats {
    category: AppCategory;
    minutes: number;
    percentage: number;
    color: string;
}
