import { db } from './db.ts';

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
   * If network drops or is offline, preserves local records with clean rollback.
   */
  static async syncObservations(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    this.isSyncing = true;

    try {
      const all = await db.getAllObservations();
      const unsynced = all.filter((obs) => !obs.synced);

      // Check online status
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        this.notify({
          status: 'offline',
          pendingCount: unsynced.length,
          syncedCount: all.length - unsynced.length,
          message: 'Device offline. Observations preserved in IndexedDB queue.'
        });
        return { synced: 0, failed: unsynced.length };
      }

      this.notify({
        status: 'syncing',
        pendingCount: unsynced.length,
        syncedCount: all.length - unsynced.length,
        message: `Syncing ${unsynced.length} records...`
      });

      // Small delay to provide realistic tactile feedback
      await new Promise((resolve) => setTimeout(resolve, 300));

      const successfullySyncedIds: string[] = [];

      try {
        for (const obs of unsynced) {
          // Mid-sync dropout check
          if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            throw new Error('Network disconnected during sync batch');
          }
          await db.updateObservation(obs.id, { synced: true });
          successfullySyncedIds.push(obs.id);
        }
      } catch (batchErr) {
        // Rollback any records modified in this interrupted batch
        console.warn('Interrupted sync batch, rolling back:', batchErr);
        for (const id of successfullySyncedIds) {
          try {
            await db.updateObservation(id, { synced: false });
          } catch {}
        }
        throw batchErr;
      }

      this.lastSynced = Date.now();
      const totalCount = await db.getCount();

      this.notify({
        status: 'synced',
        pendingCount: 0,
        syncedCount: totalCount,
        lastSyncedTimestamp: this.lastSynced,
        message: `Successfully synchronized ${successfullySyncedIds.length} observations`
      });

      return { synced: successfullySyncedIds.length, failed: 0 };
    } catch (err) {
      console.error('Sync error:', err);
      const pending = await this.getPendingCount();
      this.notify({
        status: 'error',
        pendingCount: pending,
        syncedCount: 0,
        message: 'Sync interrupted: network dropped or offline. Zero data loss.'
      });
      return { synced: 0, failed: pending };
    } finally {
      this.isSyncing = false;
    }
  }
}
