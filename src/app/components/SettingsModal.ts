import { getModelRunner, getRunnerMode, setRunnerMode, type RunnerMode } from '../../runner';
import { CloudSyncManager } from '../../storage/sync';
import { GeoLocationTracker } from '../../utils/geolocation';

export class SettingsModal {
  private static modalEl: HTMLElement | null = null;

  static async open(onModeChanged: (mode: RunnerMode) => void): Promise<void> {
    if (this.modalEl) return;

    const currentMode = getRunnerMode();
    const runner = getModelRunner();
    const coords = await GeoLocationTracker.getCurrentPosition();
    const syncStatus = await CloudSyncManager.getSyncStatus();

    const backdrop = document.createElement('div');
    backdrop.className = 'stitch-modal-backdrop';
    backdrop.id = 'settings-modal-backdrop';

    backdrop.innerHTML = `
      <div class="stitch-modal-content">
        <div class="flex items-center justify-between pb-3 border-b border-outline-hairline">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-[24px]">tune</span>
            <h3 class="font-headline-md text-headline-md text-primary font-serif">TrailScribe Settings</h3>
          </div>
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all cursor-pointer" id="btn-close-settings">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="py-4 space-y-4">
          <!-- Model Engine Switcher -->
          <div>
            <label class="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider block mb-2">
              Naturalist AI Engine
            </label>
            <div class="grid grid-cols-1 gap-2">
              <button 
                class="settings-mode-btn p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${currentMode === 'gemma' ? 'bg-secondary-container/40 border-secondary ring-1 ring-secondary' : 'bg-surface-card border-outline-hairline'}"
                data-mode="gemma"
              >
                <div>
                  <span class="font-title-md text-title-md text-primary font-bold block">✦ Gemma Local (Ollama)</span>
                  <span class="text-body-sm text-on-surface-variant block">On-device quantized deep reasoning</span>
                </div>
                ${currentMode === 'gemma' ? '<span class="material-symbols-outlined text-secondary text-[22px]">check_circle</span>' : ''}
              </button>

              <button 
                class="settings-mode-btn p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${currentMode === 'heuristic' ? 'bg-secondary-container/40 border-secondary ring-1 ring-secondary' : 'bg-surface-card border-outline-hairline'}"
                data-mode="heuristic"
              >
                <div>
                  <span class="font-title-md text-title-md text-primary font-bold block">⚡ Fast Heuristic Parser (Offline)</span>
                  <span class="text-body-sm text-on-surface-variant block">Instant zero-latency rule parser</span>
                </div>
                ${currentMode === 'heuristic' ? '<span class="material-symbols-outlined text-secondary text-[22px]">check_circle</span>' : ''}
              </button>
            </div>
          </div>

          <!-- Hardware & Sensor Diagnostics -->
          <div class="p-3 bg-surface-card rounded-xl border border-outline-hairline space-y-2">
            <span class="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider block">
              Sensor & Hardware Telemetry
            </span>
            <div class="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>Model Status</span>
              <span class="font-mono text-secondary font-semibold">${runner.status.toUpperCase()}</span>
            </div>
            <div class="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>GPS Coordinates</span>
              <span class="font-mono text-primary">${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°</span>
            </div>
            <div class="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>Cloud Sync Queue</span>
              <span class="font-mono text-amber-on-container font-semibold">${syncStatus.pendingCount} pending</span>
            </div>
          </div>

          <!-- Cloud Sync Quick Trigger -->
          <button class="w-full h-11 rounded-lg bg-primary-container text-vellum-bg font-title-md text-body-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:bg-secondary cursor-pointer" id="btn-modal-sync">
            <span class="material-symbols-outlined text-[18px]">cloud_sync</span>
            <span id="modal-sync-text">Synchronize Records</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;

    // Events
    const closeBtn = document.getElementById('btn-close-settings');
    closeBtn?.addEventListener('click', () => this.close());

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });

    const modeBtns = backdrop.querySelectorAll('.settings-mode-btn');
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as RunnerMode;
        if (mode) {
          setRunnerMode(mode);
          onModeChanged(mode);
          this.close();
        }
      });
    });

    const syncBtn = document.getElementById('btn-modal-sync');
    const syncText = document.getElementById('modal-sync-text');
    syncBtn?.addEventListener('click', async () => {
      if (syncText) syncText.textContent = 'Syncing...';
      const result = await CloudSyncManager.syncObservations();
      if (syncText) syncText.textContent = `Synced ${result.synced} items!`;
      setTimeout(() => this.close(), 800);
    });
  }

  static close(): void {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
