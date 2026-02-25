/**
 * Real-Time Sync Service
 * Uses BroadcastChannel API for instant cross-tab synchronization
 * Falls back to localStorage events for older browsers
 */

import { Report } from '../App';

type SyncEventType = 'REPORT_ADDED' | 'REPORT_UPDATED' | 'REPORT_DELETED' | 'REPORTS_SYNC';

interface SyncMessage {
    type: SyncEventType;
    data: any;
    timestamp: number;
    source: 'citizen' | 'admin';
}

type SyncListener = (message: SyncMessage) => void;

class SyncService {
    private channel: BroadcastChannel | null = null;
    private listeners: SyncListener[] = [];
    private isSupported: boolean;

    constructor() {
        // Check BroadcastChannel support
        this.isSupported = typeof BroadcastChannel !== 'undefined';

        if (this.isSupported) {
            try {
                this.channel = new BroadcastChannel('swachh-nagar-sync');
                this.setupChannelListeners();
                console.log('[SyncService] BroadcastChannel initialized ✓');
            } catch (error) {
                console.warn('[SyncService] BroadcastChannel failed, using fallback:', error);
                this.isSupported = false;
            }
        }

        if (!this.isSupported) {
            // Fallback to storage events
            this.setupStorageListeners();
            console.log('[SyncService] Using localStorage fallback');
        }
    }

    private setupChannelListeners() {
        if (!this.channel) return;

        this.channel.onmessage = (event) => {
            const message = event.data as SyncMessage;
            console.log('[SyncService] BroadcastChannel message received:', message.type, message.source);
            this.notifyListeners(message);
        };

        this.channel.onmessageerror = (error) => {
            console.error('[SyncService] BroadcastChannel message error:', error);
        };
    }

    private setupStorageListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'swachh_nagar_sync_event' && e.newValue) {
                try {
                    const message = JSON.parse(e.newValue) as SyncMessage;
                    console.log('[SyncService] Storage event received:', message.type);
                    this.notifyListeners(message);
                } catch (error) {
                    console.error('[SyncService] Failed to parse storage event:', error);
                }
            }
        });
    }

    /**
     * Broadcast a sync event to all tabs
     */
    broadcast(type: SyncEventType, data: any, source: 'citizen' | 'admin' = 'citizen') {
        const message: SyncMessage = {
            type,
            data,
            timestamp: Date.now(),
            source
        };

        if (this.isSupported && this.channel) {
            // Use BroadcastChannel (modern browsers)
            try {
                this.channel.postMessage(message);
                console.log('[SyncService] Broadcast via BroadcastChannel:', type, source);
            } catch (error) {
                console.error('[SyncService] Broadcast failed:', error);
            }
        } else {
            // Fallback to localStorage
            try {
                localStorage.setItem('swachh_nagar_sync_event', JSON.stringify(message));
                // Clear immediately so next event triggers storage event
                setTimeout(() => localStorage.removeItem('swachh_nagar_sync_event'), 10);
                console.log('[SyncService] Broadcast via localStorage:', type);
            } catch (error) {
                console.error('[SyncService] localStorage broadcast failed:', error);
            }
        }
    }

    /**
     * Subscribe to sync events
     */
    subscribe(listener: SyncListener): () => void {
        this.listeners.push(listener);
        console.log('[SyncService] Listener subscribed, total:', this.listeners.length);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
            console.log('[SyncService] Listener unsubscribed, remaining:', this.listeners.length);
        };
    }

    private notifyListeners(message: SyncMessage) {
        this.listeners.forEach(listener => {
            try {
                listener(message);
            } catch (error) {
                console.error('[SyncService] Listener error:', error);
            }
        });
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.channel) {
            this.channel.close();
            console.log('[SyncService] BroadcastChannel closed');
        }
        this.listeners = [];
    }
}

// Export singleton instance
export const syncService = new SyncService();
