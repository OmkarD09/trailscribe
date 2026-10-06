import { GeoLocationTracker } from '../../utils/geolocation';

export interface AdventureSessionSummary {
  minutes: number;
  distanceKm: number;
  discoveriesCount: number;
  phoneFreePercent: number;
  trailName?: string;
}

export class AdventureModeView {
  private container: HTMLElement;
  private onSpotSpecimen: () => void;
  private onConcludeAdventure: (summary: AdventureSessionSummary) => void;
  private onOpenMap: () => void;
  private isPaused: boolean = false;
  private elapsedSeconds: number = 18 * 60; // Default starts at 18 minutes
  private distanceKm: number = 0.84;
  private discoveriesCount: number = 1;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    container: HTMLElement,
    callbacks: {
      onSpotSpecimen: () => void;
      onConcludeAdventure: (summary: AdventureSessionSummary) => void;
      onOpenMap: () => void;
    }
  ) {
    this.container = container;
    this.onSpotSpecimen = callbacks.onSpotSpecimen;
    this.onConcludeAdventure = callbacks.onConcludeAdventure;
    this.onOpenMap = callbacks.onOpenMap;
  }

  render(): void {
    const minutes = Math.floor(this.elapsedSeconds / 60);
    const progressArc = Math.min(100, Math.round((minutes / 45) * 100));

    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-safe view-enter">
        <div class="px-margin pt-space-md flex flex-col gap-space-lg max-w-md mx-auto w-full">
          <!-- Instrument Telemetry Strip with Direct Map Jump -->
          <div class="flex items-center justify-between bg-surface-card-subtle px-space-md py-space-sm rounded-xl shadow-sm border border-outline-hairline/60 gap-2">
            <button class="flex items-center gap-space-xs text-left cursor-pointer hover:opacity-80 active:scale-95 transition-all group min-w-0 flex-1" id="gps-telemetry-btn" title="Tap to lock GPS or view on Map">
              <span class="w-2.5 h-2.5 rounded-full bg-primary animate-ping shrink-0"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-primary -ml-space-xs shrink-0"></span>
              <div class="flex flex-col pl-1 min-w-0">
                <span class="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-mono font-bold group-hover:underline truncate" id="gps-telemetry-label">GPS Lock • Acquiring...</span>
                <span class="text-[10px] text-on-surface-variant font-mono truncate" id="gps-source-label">Connecting GPS Sensor</span>
              </div>
            </button>
            <div class="flex items-center gap-1.5 shrink-0">
              <button class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-container text-vellum-bg text-label-sm font-semibold hover:bg-secondary active:scale-95 transition-all cursor-pointer shadow-sm" id="view-map-strip-btn" title="Open Interactive Trail Map">
                <span class="material-symbols-outlined text-[16px]">explore</span>
                <span>MAP</span>
              </button>
            </div>
          </div>

          <!-- Outdoor Biometric & Sunlight Metrics -->
          <div class="grid grid-cols-2 gap-space-sm">
            <!-- Sunlight / Time in Canopy Card -->
            <div class="bg-surface-card rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden border border-outline-hairline/60">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Field Time</span>
                <span class="material-symbols-outlined text-secondary text-[20px]">wb_sunny</span>
              </div>
              <div class="flex items-center gap-space-sm my-space-sm">
                <!-- Solar progress indicator (18m of 45m daylight cycle) -->
                <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg class="w-full h-full -rotate-90" viewbox="0 0 36 36">
                    <path class="text-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"></path>
                    <path id="sunlight-arc" class="text-on-tertiary-container transition-all duration-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="${progressArc}, 100" stroke-linecap="round" stroke-width="3.5"></path>
                  </svg>
                  <span class="material-symbols-outlined absolute text-[16px] text-tertiary">forest</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-headline-md text-headline-md text-primary leading-none font-serif"><span id="field-time-mins">${minutes}</span><span class="font-body-sm text-body-sm text-secondary ml-0.5">m</span></span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant">Sunlight Bath</span>
                </div>
              </div>
              <div class="font-label-sm text-label-sm text-secondary flex items-center gap-1 font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Natural UV Index 3 (Gentle)
              </div>
            </div>

            <!-- Discovery Breadcrumb Metric Card -->
            <div class="bg-surface-card rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-outline-hairline/60">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Encounter</span>
                <span class="material-symbols-outlined text-secondary text-[20px]">eco</span>
              </div>
              <div class="flex items-center gap-space-sm my-space-sm">
                <div class="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-primary font-headline-md text-headline-md shrink-0 font-serif" id="encounter-badge-count">
                  ${this.discoveriesCount < 10 ? `0${this.discoveriesCount}` : this.discoveriesCount}
                </div>
                <div class="flex flex-col">
                  <span class="font-headline-md text-headline-md text-primary leading-none font-serif">Noted</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant truncate">Steller's Jay</span>
                </div>
              </div>
              <!-- Breadcrumb Dot Trail -->
              <div class="flex items-center gap-1.5 pt-1">
                <span class="w-2 h-2 rounded-full bg-primary" title="Trail waypoint 1"></span>
                <span class="w-1 h-0.5 bg-outline-variant"></span>
                <span class="w-2 h-2 rounded-full bg-primary" title="Trail waypoint 2"></span>
                <span class="w-1 h-0.5 bg-outline-variant"></span>
                <span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim ring-2 ring-amber-container animate-pulse" title="Active search sector"></span>
                <span class="w-1 h-0.5 bg-outline-variant"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-surface-container-high" title="Upcoming trail waypoint"></span>
                <span class="w-1 h-0.5 bg-outline-variant"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-surface-container-high" title="Destination waypoint"></span>
              </div>
            </div>
          </div>

          <!-- Large Central Quest Folio Card -->
          <div class="relative bg-surface-card rounded-xl p-space-lg shadow-md overflow-hidden flex flex-col items-center text-center border border-outline-hairline/60">
            <div class="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-sage-fill/40 pointer-events-none blur-2xl"></div>
            <div class="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-amber-container/30 pointer-events-none blur-xl"></div>
            
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-fill text-primary font-label-sm text-label-sm uppercase tracking-wider mb-space-md font-bold">
              <span class="material-symbols-outlined text-[15px]">psychology_alt</span>
              Field Prompt • Active
            </div>

            <!-- Specimen Search Headline -->
            <h2 class="font-headline-lg text-headline-lg text-primary max-w-[280px] leading-tight mb-space-xs font-serif">
              Find Something Blue
            </h2>
            <p class="font-latin-name text-latin-name italic text-secondary mb-space-md font-serif">
              Cyanocitta, Gentiana, or weathered shale
            </p>

            <!-- Specimen Illustration / Naturalist Prompt Framing -->
            <div class="w-full h-44 rounded-lg overflow-hidden relative my-space-xs shadow-inner">
              <img class="w-full h-full object-cover" alt="Wild blue gentian" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2jclSA-c91Q92_7pr9C7YxYVxoMWkQJB5HgLOtgbNQmatymyEf_GEWehtVW84YVgbu5BanQkVexOrspRdHGNsHKOxl9rPAyqXLPp0z3esRARItFiytO-77heOwymLizcizGXekbsMagw_UHDHmIBU2PzS_glLUCwi-qRjQIO_L9FLTb-fLqtHxwWb79h1geTihlHj27_jU03Ng4dQswC8qS4YNMWgBI5GhO_uYSEqWPXbW6fqEZM5"/>
              <div class="absolute inset-0 bg-gradient-to-t from-obsidian-scrim via-transparent to-transparent flex items-end p-space-md">
                <p class="font-body-sm text-body-sm text-vellum-bg text-left leading-snug">
                  Look along shadowy creek banks, damp stones, or fallen fir bark.
                </p>
              </div>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant mt-space-md max-w-xs">
              Look around. Your next discovery is closer than you think. Let your peripheral senses settle.
            </p>
          </div>

          <!-- Zen Mindful Guidance Notice -->
          <div class="bg-surface-card-subtle rounded-xl p-space-md flex items-start gap-space-md shadow-sm border border-outline-hairline/60">
            <div class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0 text-primary">
              <span class="material-symbols-outlined text-[22px]">vibration</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-title-md text-title-md text-primary leading-tight mb-0.5 font-bold">Pocket TrailScribe</span>
              <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Put your phone away. TrailScribe alerts you with gentle haptic pulses when crossing habitats of rare flora or cataloged bird calls.
              </p>
            </div>
          </div>

          <!-- Active Trail Status Banner (Clickable to Map) -->
          <div class="flex items-center justify-between px-space-md py-space-sm bg-surface-container rounded-lg text-on-surface-variant font-label-md text-label-md cursor-pointer hover:bg-surface-container-high active:scale-[0.99] transition-all" id="adventure-trail-banner" title="Open Interactive Trail Map">
            <div class="flex items-center gap-space-xs truncate">
              <span class="material-symbols-outlined text-[18px] text-secondary">explore</span>
              <span class="truncate font-semibold">Redwood Creek Trailhead sector 4</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="font-label-sm text-label-sm text-secondary pl-space-xs font-mono font-bold" id="adventure-km-label">${this.distanceKm.toFixed(2)} km</span>
              <span class="material-symbols-outlined text-[16px] text-secondary">chevron_right</span>
            </div>
          </div>

          <!-- Bottom Thumb Actions Area -->
          <div class="flex flex-col gap-space-sm pt-space-xs pb-space-lg">
            <div class="grid grid-cols-2 gap-space-sm">
              <button class="w-full h-12 rounded-lg bg-surface-card text-primary font-title-md text-title-md shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs cursor-pointer border border-outline-hairline/60" id="open-field-map-btn" title="View Interactive Trail Map">
                <span class="material-symbols-outlined text-[20px] text-secondary">map</span>
                <span>Field Map</span>
              </button>
              <button class="w-full h-12 rounded-lg bg-surface-card text-primary font-title-md text-title-md shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs cursor-pointer border border-outline-hairline/60" id="pause-adventure-btn">
                <span class="material-symbols-outlined text-[20px]" id="pause-icon">pause_circle</span>
                <span id="pause-label">Pause</span>
              </button>
            </div>
            <button class="w-full h-12 rounded-lg bg-primary-container text-vellum-bg font-title-md text-title-md shadow-md active:bg-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs cursor-pointer" id="spotted-btn">
              <span class="material-symbols-outlined text-[20px]">photo_camera</span>
              <span>I Spotted It (Capture)</span>
            </button>
            <button class="w-full py-2.5 text-center text-secondary hover:text-primary font-label-md text-label-md uppercase tracking-wider font-bold transition-colors cursor-pointer" id="conclude-adventure-btn">
              Conclude Adventure & Review
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.startActiveEngine();
  }

  private startActiveEngine(): void {
    this.stop();

    // Start timer interval for live sunlight bath and tracking
    this.timerInterval = setInterval(() => {
      if (this.isPaused) return;

      this.elapsedSeconds += 1;
      const mins = Math.floor(this.elapsedSeconds / 60);

      // Update minutes display every second
      const minsEl = this.container.querySelector('#field-time-mins');
      if (minsEl) minsEl.textContent = String(mins);

      // Update solar progress arc
      const arcEl = this.container.querySelector('#sunlight-arc');
      if (arcEl) {
        const progressArc = Math.min(100, Math.round((mins / 45) * 100));
        arcEl.setAttribute('stroke-dasharray', `${progressArc}, 100`);
      }

      // Increment distance gently
      if (this.elapsedSeconds % 5 === 0) {
        this.distanceKm += 0.01;
        const kmEl = this.container.querySelector('#adventure-km-label');
        if (kmEl) kmEl.textContent = `${this.distanceKm.toFixed(2)} km`;
      }
    }, 1000);

    // Refresh GPS coordinates with hardware query
    this.refreshGpsTelemetry(false);
  }

  private async refreshGpsTelemetry(forceFresh = false): Promise<void> {
    try {
      const coords = await GeoLocationTracker.getCurrentPosition(forceFresh);
      const label = this.container.querySelector('#gps-telemetry-label');
      const sourceLabel = this.container.querySelector('#gps-source-label');
      const source = GeoLocationTracker.getLocationSource();

      if (label) {
        label.textContent = `GPS Lock • ${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E`;
      }
      if (sourceLabel) {
        const sourceDesc =
          source === 'gps'
            ? `Hardware GPS (±${coords.accuracy || 12}m)`
            : source === 'network'
            ? `Cellular/Wi-Fi (±${coords.accuracy || 45}m)`
            : source === 'ip'
            ? `Network Geolocation (±1km)`
            : 'Estimated Field Sector';
        sourceLabel.textContent = sourceDesc;
      }
    } catch {
      const sourceLabel = this.container.querySelector('#gps-source-label');
      if (sourceLabel) sourceLabel.textContent = 'Searching for Satellites...';
    }
  }

  public stop(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private bindEvents(): void {
    // Navigation to Map triggers
    const viewMapStripBtn = this.container.querySelector('#view-map-strip-btn');
    viewMapStripBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onOpenMap();
    });

    const openFieldMapBtn = this.container.querySelector('#open-field-map-btn');
    openFieldMapBtn?.addEventListener('click', () => {
      this.onOpenMap();
    });

    const trailBanner = this.container.querySelector('#adventure-trail-banner');
    trailBanner?.addEventListener('click', () => {
      this.onOpenMap();
    });

    // Telemetry Button: Tap to refresh position and/or jump to map
    const telemetryBtn = this.container.querySelector('#gps-telemetry-btn');
    telemetryBtn?.addEventListener('click', async () => {
      telemetryBtn.classList.add('scale-95');
      await this.refreshGpsTelemetry(true);
      setTimeout(() => {
        telemetryBtn.classList.remove('scale-95');
        this.onOpenMap();
      }, 200);
    });

    const pauseBtn = this.container.querySelector('#pause-adventure-btn');
    const pauseIcon = this.container.querySelector('#pause-icon');
    const pauseLabel = this.container.querySelector('#pause-label');
    const statusLabel = this.container.querySelector('#field-scan-status');

    pauseBtn?.addEventListener('click', () => {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        pauseIcon!.textContent = 'play_circle';
        pauseLabel!.textContent = 'Resume';
        if (statusLabel) statusLabel.textContent = 'Field Quest Paused';
        pauseBtn.classList.add('bg-amber-container', 'text-amber-on-container');
      } else {
        pauseIcon!.textContent = 'pause_circle';
        pauseLabel!.textContent = 'Pause';
        if (statusLabel) statusLabel.textContent = 'Passive Scan Active';
        pauseBtn.classList.remove('bg-amber-container', 'text-amber-on-container');
      }
    });

    const spottedBtn = this.container.querySelector('#spotted-btn');
    spottedBtn?.addEventListener('click', () => {
      this.discoveriesCount += 1;
      const countEl = this.container.querySelector('#encounter-badge-count');
      if (countEl) {
        countEl.textContent = this.discoveriesCount < 10 ? `0${this.discoveriesCount}` : String(this.discoveriesCount);
      }
      this.stop();
      this.onSpotSpecimen();
    });

    const concludeBtn = this.container.querySelector('#conclude-adventure-btn');
    concludeBtn?.addEventListener('click', () => {
      this.stop();
      const minutes = Math.max(1, Math.round(this.elapsedSeconds / 60));
      const summary: AdventureSessionSummary = {
        minutes,
        distanceKm: Number(this.distanceKm.toFixed(1)),
        discoveriesCount: this.discoveriesCount,
        phoneFreePercent: Math.min(94, Math.max(60, Math.round(71 + (minutes % 8)))),
        trailName: 'Redwood Creek Trailhead'
      };
      this.onConcludeAdventure(summary);
    });
  }
}
