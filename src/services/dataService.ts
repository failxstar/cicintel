import { Report, Comment, User } from '../App';

const API_URL = 'http://localhost:5000';
const STORAGE_KEYS = {
    REPORTS: 'swachh_nagar_reports',
    USERS: 'swachh_nagar_users',
    CONFIG: 'swachh_nagar_config',
};

type DataChangeListener = (reports: Report[]) => void;

class DataService {
    private listeners: DataChangeListener[] = [];
    private cache: Report[] = [];
    private pollingInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        // Load initial data from API
        this.loadReportsFromAPI();

        // Start polling for updates every 5 seconds
        this.startPolling();
    }

    /**
     * Start polling for updates from backend
     */
    private startPolling(): void {
        // Poll every 5 seconds
        this.pollingInterval = setInterval(() => {
            this.loadReportsFromAPI();
        }, 5000);
    }

    /**
     * Stop polling (cleanup)
     */
    stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Load reports from backend API
     */
    async loadReportsFromAPI(): Promise<Report[]> {
        try {
            const response = await fetch(`${API_URL}/api/reports`);
            if (!response.ok) {
                console.warn('[dataService] API not available, using localStorage');
                return this.getReports();
            }

            const reports = await response.json();
            this.cache = reports.map((r: any) => ({
                ...r,
                timestamp: new Date(r.timestamp),
                comments: r.comments?.map((c: any) => ({
                    ...c,
                    timestamp: new Date(c.timestamp),
                })) || [],
            }));

            // Also save to localStorage as backup
            this.saveReports(this.cache);
            this.notifyListeners(this.cache);

            return this.cache;
        } catch (error) {
            console.error('[dataService] Error loading from API:', error);
            // Fallback to localStorage
            return this.getReports();
        }
    }

    /**
     * Get reports from localStorage (fallback)
     */
    getReports(): Report[] {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
            if (!data) return [];

            const reports = JSON.parse(data);
            return reports.map((r: any) => ({
                ...r,
                timestamp: new Date(r.timestamp),
                comments: r.comments.map((c: any) => ({
                    ...c,
                    timestamp: new Date(c.timestamp),
                })),
            }));
        } catch (error) {
            console.error('Error loading reports:', error);
            return [];
        }
    }

    /**
     * Save reports to localStorage (backup)
     */
    private saveReports(reports: Report[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
        } catch (error) {
            console.error('Error saving reports:', error);
        }
    }

    /**
     * Add a new report (sends to API)
     */
    async addReport(report: Report): Promise<void> {
        try {
            // Send to API
            const response = await fetch(`${API_URL}/api/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report),
            });

            if (response.ok) {
                console.log('[dataService] ✅ Report added to API');
                // Reload from API to get latest data
                await this.loadReportsFromAPI();
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.error('[dataService] API error, saving to localStorage only:', error);
            // Fallback to localStorage
            const reports = this.getReports();
            reports.push(report);
            this.saveReports(reports);
            this.notifyListeners(reports);
        }
    }

    /**
     * Update an existing report (sends to API)
     */
    async updateReport(reportId: string, updates: Partial<Report>): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                console.log('[dataService] ✅ Report updated in API');
                await this.loadReportsFromAPI();
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.error('[dataService] API error, updating localStorage only:', error);
            // Fallback to localStorage
            const reports = this.getReports();
            const index = reports.findIndex((r) => r.id === reportId);
            if (index !== -1) {
                reports[index] = { ...reports[index], ...updates };
                this.saveReports(reports);
                this.notifyListeners(reports);
            }
        }
    }

    /**
     * Delete a report (sends to API)
     */
    async deleteReport(reportId: string): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log('[dataService] ✅ Report deleted from API');
                await this.loadReportsFromAPI();
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.error('[dataService] API error, deleting from localStorage only:', error);
            // Fallback to localStorage
            const reports = this.getReports();
            const filtered = reports.filter((r) => r.id !== reportId);
            this.saveReports(filtered);
            this.notifyListeners(filtered);
        }
    }

    /**
     * Add a comment to a report
     */
    async addComment(reportId: string, comment: Comment): Promise<void> {
        const reports = this.cache.length ? this.cache : this.getReports();
        const report = reports.find((r) => r.id === reportId);

        if (report) {
            report.comments.push(comment);
            await this.updateReport(reportId, { comments: report.comments });
        }
    }

    /**
     * Toggle upvote on a report
     */
    async toggleUpvote(reportId: string, userId: string): Promise<void> {
        const reports = this.cache.length ? this.cache : this.getReports();
        const report = reports.find((r) => r.id === reportId);

        if (report) {
            if (report.hasUserUpvoted) {
                report.upvotes--;
                report.hasUserUpvoted = false;
            } else {
                report.upvotes++;
                report.hasUserUpvoted = true;
            }

            await this.updateReport(reportId, {
                upvotes: report.upvotes,
                hasUserUpvoted: report.hasUserUpvoted,
            });
        }
    }

    /**
     * Subscribe to data changes
     */
    subscribe(listener: DataChangeListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    /**
     * Notify all listeners of data changes
     */
    private notifyListeners(reports: Report[]): void {
        this.listeners.forEach((listener) => listener(reports));
    }

    /**
     * Clear all reports (dev only)
     */
    clearReports(): void {
        this.cache = [];
        this.saveReports([]);
        this.notifyListeners([]);
    }

    /**
     * User management
     */
    getUsers(): User[] {
        const data = localStorage.getItem(STORAGE_KEYS.USERS);
        return data ? JSON.parse(data) : [];
    }

    addUser(user: User): void {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
}

export const dataService = new DataService();
