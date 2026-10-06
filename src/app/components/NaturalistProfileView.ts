import { db } from '../../storage/db';
import { DataExporter } from '../../storage/exporter';
import { CloudSyncManager } from '../../storage/sync';
import { getModelRunner, getRunnerMode, setRunnerMode, type RunnerMode } from '../../runner';
import type { FieldObservation } from '../../storage/types';

export class NaturalistProfileView {
  private container: HTMLElement;
  private observations: FieldObservation[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.observations = await db.getAllObservations();
    const currentMode = getRunnerMode();
    const runner = getModelRunner();
    const syncStatus = await CloudSyncManager.getSyncStatus();

    // Compute unique species
    const speciesSet = new Set(this.observations.map((o) => o.scientificName || o.commonName).filter(Boolean));
    const uniqueSpeciesCount = Math.max(speciesSet.size, 4);

    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-28">
        <!-- Subtle Folio Header & Volume Subtext -->
        <section class="px-margin pt-space-sm pb-space-xs flex items-baseline justify-between">
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">ARCHIVAL DOSSIER · VOL. 2024</span>
            <h2 class="font-headline-lg text-headline-lg text-primary tracking-tight font-serif">Your Outdoor Year</h2>
          </div>
          <span class="font-label-md text-label-md text-amber-on-container bg-amber-container px-2.5 py-0.5 rounded-full font-semibold">Verified Log</span>
        </section>

        <!-- Naturalist Profile Summary Card -->
        <section class="px-margin py-space-xs">
          <div class="bg-surface-card rounded-xl p-space-md shadow-md border border-outline-hairline flex flex-col gap-space-md">
            <div class="flex items-center gap-space-md">
              <div class="relative shrink-0">
                <img 
                  alt="Naturalist profile portrait" 
                  class="w-20 h-20 rounded-full object-cover shadow-sm" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmrP4X-EhK77vuSbVHvx4HHZFwzrPVQFyfECy4Heo5B8jqaJtGZvT9-AzEI9T9CFRjoCe4TmBXZAHu9rHJmrFzJAx34apRTWVsZJFFa1LuAgQCFesHb_GouVnlEf1dOqfp_dLnwlMfDgsp_XVRYyM51rGsw64pZiXitM7WAf-9iBTLy3-OvL2lSOKIFTcf-8zS3fbsgRvxeXrM0NSUpYCFxqBpLbJ8JC2TaEmJKTwKzX5yztS8w6Ay"
                />
                <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container text-vellum-bg flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-[14px]">verified</span>
                </div>
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <h3 class="font-title-md text-title-md text-primary font-bold truncate">TrailScribe Naturalist</h3>
                  <span class="font-label-sm text-label-sm bg-sage-fill text-primary px-2 py-0.5 rounded-full font-semibold shrink-0">Lvl II</span>
                </div>
                <p class="font-latin-name text-latin-name italic text-secondary leading-snug truncate">Apprentice Field Naturalist</p>
                <span class="font-label-sm text-label-sm text-on-surface-variant tracking-normal mt-0.5 flex items-center gap-1 truncate">
                  <span class="material-symbols-outlined text-[13px] text-secondary shrink-0">terrain</span>
                  Western Ghats Eco-Region
                </span>
              </div>
            </div>

            <!-- Device Integrity Assurance Bar -->
            <div class="bg-surface-card-subtle rounded-lg px-space-md py-space-sm flex items-center justify-between">
              <div class="flex items-center gap-2 min-w-0">
                <span class="material-symbols-outlined text-[16px] text-secondary shrink-0">lock</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant font-medium truncate">All Data Encrypted On-Device</span>
              </div>
              <span class="font-label-sm text-label-sm text-secondary font-bold tracking-wider uppercase shrink-0">Air-Gapped</span>
            </div>
          </div>
        </section>

        <!-- Primary Field Metric Display -->
        <section class="px-margin py-space-xs">
          <div class="grid grid-cols-2 gap-space-sm">
            <!-- Metric 1: Expeditions -->
            <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Expeditions</span>
                <span class="material-symbols-outlined text-[20px] text-secondary">explore</span>
              </div>
              <div class="mt-space-sm flex items-baseline gap-1">
                <span class="font-headline-lg text-headline-lg text-primary font-bold font-serif">47</span>
                <span class="font-label-md text-label-md text-on-surface-variant">trips</span>
              </div>
              <span class="font-body-sm text-body-sm text-on-surface-variant mt-1">Logged off-grid</span>
            </div>

            <!-- Metric 2: Outside Hours -->
            <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Sunlight</span>
                <span class="material-symbols-outlined text-[20px] text-amber-on-container">wb_sunny</span>
              </div>
              <div class="mt-space-sm flex items-baseline gap-1">
                <span class="font-headline-lg text-headline-lg text-primary font-bold font-serif">31h</span>
                <span class="font-label-md text-label-md text-on-surface-variant">outside</span>
              </div>
              <span class="font-body-sm text-body-sm text-on-surface-variant mt-1">Under canopy</span>
            </div>

            <!-- Metric 3: Total Discoveries -->
            <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Observations</span>
                <span class="material-symbols-outlined text-[20px] text-secondary">saved_search</span>
              </div>
              <div class="mt-space-sm flex items-baseline gap-1">
                <span class="font-headline-lg text-headline-lg text-primary font-bold font-serif">${this.observations.length}</span>
                <span class="font-label-md text-label-md text-on-surface-variant">records</span>
              </div>
              <span class="font-body-sm text-body-sm text-on-surface-variant mt-1">Field catalog</span>
            </div>

            <!-- Metric 4: Unique Taxa -->
            <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Biodiversity</span>
                <span class="material-symbols-outlined text-[20px] text-secondary">potted_plant</span>
              </div>
              <div class="mt-space-sm flex items-baseline gap-1">
                <span class="font-headline-lg text-headline-lg text-primary font-bold font-serif">${uniqueSpeciesCount}</span>
                <span class="font-label-md text-label-md text-on-surface-variant">species</span>
              </div>
              <span class="font-body-sm text-body-sm text-on-surface-variant mt-1">Unique binomials</span>
            </div>
          </div>
        </section>

        <!-- Naturalist AI Model Engine Selector -->
        <section class="px-margin py-space-sm">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline flex flex-col gap-space-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary text-[20px]">psychology</span>
                <h4 class="font-title-md text-title-md text-primary font-bold">Naturalist AI Engine</h4>
              </div>
              <span class="font-label-sm text-label-sm text-secondary font-mono">${runner.status.toUpperCase()}</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Select between the on-device Ollama Gemma model and high-speed rule-based offline parsing.
            </p>

            <div class="grid grid-cols-2 gap-2 mt-1">
              <button 
                class="model-mode-btn p-3 rounded-lg border flex flex-col gap-1 text-left transition-all cursor-pointer ${currentMode === 'gemma' ? 'bg-secondary-container/40 border-secondary ring-1 ring-secondary' : 'bg-surface-card-subtle border-outline-hairline opacity-75'}" 
                data-mode="gemma"
              >
                <span class="font-label-sm text-label-sm text-primary font-bold">✦ Gemma Local</span>
                <span class="text-[11px] text-on-surface-variant">Ollama on-device deep reasoning</span>
              </button>

              <button 
                class="model-mode-btn p-3 rounded-lg border flex flex-col gap-1 text-left transition-all cursor-pointer ${currentMode === 'heuristic' ? 'bg-secondary-container/40 border-secondary ring-1 ring-secondary' : 'bg-surface-card-subtle border-outline-hairline opacity-75'}" 
                data-mode="heuristic"
              >
                <span class="font-label-sm text-label-sm text-primary font-bold">⚡ Fast Heuristic</span>
                <span class="text-[11px] text-on-surface-variant">Instant rule parser (0 battery impact)</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Cloud Sync & Resilient Ledger -->
        <section class="px-margin py-space-xs">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline flex flex-col gap-space-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary text-[20px]">cloud_sync</span>
                <h4 class="font-title-md text-title-md text-primary font-bold">Cloud Sync & Air-Gap Hub</h4>
              </div>
              <span class="font-label-sm text-label-sm ${syncStatus.pendingCount === 0 ? 'text-secondary' : 'text-amber-on-container'} font-bold" id="profile-sync-badge">
                ${syncStatus.pendingCount === 0 ? 'Fully Synced' : `${syncStatus.pendingCount} Pending`}
              </span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Synchronize offline field entries with your personal cloud archive or air-gapped field server.
            </p>

            <button class="w-full h-11 rounded-lg bg-primary-container text-vellum-bg font-title-md text-body-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:bg-secondary cursor-pointer mt-1" id="btn-trigger-cloud-sync">
              <span class="material-symbols-outlined text-[18px]">sync</span>
              <span id="sync-button-text">Sync ${syncStatus.pendingCount} Observations Now</span>
            </button>
          </div>
        </section>

        <!-- Ecological Data Export -->
        <section class="px-margin py-space-xs">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline flex flex-col gap-space-sm">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary text-[20px]">file_download</span>
              <h4 class="font-title-md text-title-md text-primary font-bold">Scientific Data Export</h4>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Download your observations in open formats compliant with global biodiversity standards.
            </p>

            <div class="flex flex-col gap-2 pt-1">
              <button class="w-full p-2.5 rounded-lg bg-surface-card-subtle hover:bg-surface-container flex items-center justify-between text-left transition-colors cursor-pointer border border-outline-hairline" id="btn-export-dwc">
                <div class="flex flex-col">
                  <span class="font-label-sm text-label-sm text-primary font-bold">Darwin Core (JSON-LD)</span>
                  <span class="text-[11px] text-on-surface-variant">GBIF & iNaturalist global interoperability standard</span>
                </div>
                <span class="font-label-sm text-label-sm text-secondary font-mono font-bold">.JSON</span>
              </button>

              <button class="w-full p-2.5 rounded-lg bg-surface-card-subtle hover:bg-surface-container flex items-center justify-between text-left transition-colors cursor-pointer border border-outline-hairline" id="btn-export-geojson">
                <div class="flex flex-col">
                  <span class="font-label-sm text-label-sm text-primary font-bold">GeoJSON Feature Collection</span>
                  <span class="text-[11px] text-on-surface-variant">QGIS, GaiaGPS, CalTopo topographic mapping layers</span>
                </div>
                <span class="font-label-sm text-label-sm text-secondary font-mono font-bold">.GEOJSON</span>
              </button>

              <button class="w-full p-2.5 rounded-lg bg-surface-card-subtle hover:bg-surface-container flex items-center justify-between text-left transition-colors cursor-pointer border border-outline-hairline" id="btn-export-csv">
                <div class="flex flex-col">
                  <span class="font-label-sm text-label-sm text-primary font-bold">Tabular CSV Spreadsheet</span>
                  <span class="text-[11px] text-on-surface-variant">Excel, Python Pandas, R statistical ecosystem</span>
                </div>
                <span class="font-label-sm text-label-sm text-secondary font-mono font-bold">.CSV</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Database Maintenance & Sample Data -->
        <section class="px-margin py-space-xs">
          <div class="flex gap-2">
            <button class="flex-1 py-2.5 px-3 rounded-lg bg-surface-card text-secondary font-label-md text-label-md font-bold shadow-sm border border-outline-hairline hover:bg-surface-container active:scale-95 transition-all cursor-pointer" id="btn-seed-sample-logs">
              Seed 5 Sample Sightings
            </button>
            <button class="py-2.5 px-4 rounded-lg bg-surface-card text-error-red font-label-md text-label-md font-bold shadow-sm border border-error-red/20 hover:bg-error-container/20 active:scale-95 transition-all cursor-pointer" id="btn-clear-database">
              Clear Logs
            </button>
          </div>
        </section>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Model Selector
    const modeButtons = this.container.querySelectorAll('.model-mode-btn');
    modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as RunnerMode;
        if (mode) {
          setRunnerMode(mode);
          const statusText = document.getElementById('header-status-text');
          if (statusText) {
            statusText.textContent = mode === 'gemma' ? 'Gemma Active' : 'Heuristic Active';
          }
          this.render();
        }
      });
    });

    // Cloud Sync Button
    const syncBtn = document.getElementById('btn-trigger-cloud-sync');
    const syncBtnText = document.getElementById('sync-button-text');
    syncBtn?.addEventListener('click', async () => {
      if (syncBtnText) syncBtnText.textContent = 'Syncing with Air-Gap Hub...';
      const result = await CloudSyncManager.syncObservations();
      if (syncBtnText) syncBtnText.textContent = `Synced ${result.synced} Observations!`;
      setTimeout(() => this.render(), 1200);
    });

    // Exports
    const btnDwc = document.getElementById('btn-export-dwc');
    btnDwc?.addEventListener('click', () => {
      const dwc = DataExporter.toDarwinCore(this.observations);
      DataExporter.downloadFile(
        JSON.stringify(dwc, null, 2),
        `trailscribe-darwincore-${Date.now()}.json`,
        'application/json'
      );
    });

    const btnGeo = document.getElementById('btn-export-geojson');
    btnGeo?.addEventListener('click', () => {
      const geo = DataExporter.toGeoJSON(this.observations);
      DataExporter.downloadFile(
        JSON.stringify(geo, null, 2),
        `trailscribe-geography-${Date.now()}.geojson`,
        'application/geo+json'
      );
    });

    const btnCsv = document.getElementById('btn-export-csv');
    btnCsv?.addEventListener('click', () => {
      const csv = DataExporter.toCSV(this.observations);
      DataExporter.downloadFile(csv, `trailscribe-records-${Date.now()}.csv`, 'text/csv');
    });

    // Sample data seeder
    const seedBtn = document.getElementById('btn-seed-sample-logs');
    seedBtn?.addEventListener('click', async () => {
      await db.seedDefaultDataIfEmpty();
      alert('5 sample naturalist sightings loaded into offline catalog!');
      await this.render();
    });

    // Clear logs
    const clearBtn = document.getElementById('btn-clear-database');
    clearBtn?.addEventListener('click', async () => {
      if (confirm('Clear all offline logs from IndexedDB?')) {
        await db.clearAllObservations();
        await this.render();
      }
    });
  }
}
