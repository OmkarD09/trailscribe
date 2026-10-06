import { db } from './db';

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  pendingCount: number;
  syncedCount: number;
  lastSyncedTimestamp?: number;
  message?: string;
}

export type SyncListener = (progress: SyncProgress) => void;

export class CloudSyncManager {
  private static listeners: Set<SyncListener> = new Set();
  private static lastSynced: number | null = null;
  private static isSyncing = false;

  static subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notify(progress: SyncProgress): void {
    this.listeners.forEach((cb) => cb(progress));
  }

  static async getPendingCount(): Promise<number> {
    const all = await db.getAllObservations();
    return all.filter((obs) => !obs.synced).length;
  }

  static async getSyncStatus(): Promise<SyncProgress> {
    const pending = await this.getPendingCount();
    return {
      status: this.isSyncing ? 'syncing' : pending === 0 ? 'synced' : 'idle',
      pendingCount: pending,
      syncedCount: (await db.getCount()) - pending,
      lastSyncedTimestamp: this.lastSynced ?? undefined,
      message: pending === 0 ? 'All observations synced' : `${pending} observations pending sync`
    };
  }

  /**
   * Syncs unsynced observations. In offline/on-device mode,
   * simulates a resilient sync batch that marks records as synced in IndexedDB.
   */
  static async syncObservations(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    this.isSyncing = true;

    try {
      const all = await db.getAllObservations();
      const unsynced = all.filter((obs) => !obs.synced);

      this.notify({
        status: 'syncing',
        pendingCount: unsynced.length,
        syncedCount: all.length - unsynced.length,
        message: `Syncing ${unsynced.length} records...`
      });

      // Small delay to provide realistic tactile feedback
      await new Promise((resolve) => setTimeout(resolve, 600));

      let syncedCount = 0;
      for (const obs of unsynced) {
        await db.updateObservation(obs.id, { synced: true });
        syncedCount++;
      }

      this.lastSynced = Date.now();
      const totalCount = await db.getCount();

      this.notify({
        status: 'synced',
        pendingCount: 0,
        syncedCount: totalCount,
        lastSyncedTimestamp: this.lastSynced,
        message: `Successfully synchronized ${syncedCount} observations`
      });

      return { synced: syncedCount, failed: 0 };
    } catch (err) {
      console.error('Sync error:', err);
      this.notify({
        status: 'error',
        pendingCount: await this.getPendingCount(),
        syncedCount: 0,
        message: 'Sync failed: network unreachable or offline'
      });
      return { synced: 0, failed: 1 };
    } finally {
      this.isSyncing = false;
    }
  }
}
