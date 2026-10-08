import { db } from '../../storage/db';
import { GeoLocationTracker } from '../../utils/geolocation';
import { AudioFeedback } from '../../utils/audio-helpers';
import { SolarEphemerisCalculator } from '../../utils/ephemeris';

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
  private triggeredGeofences: Set<string> = new Set();
  private lastGeofenceCheck: number = 0;
  private breadcrumbs: Array<{ latitude: number; longitude: number; timestamp: number }> = [];
  private trailheadOrigin: { latitude: number; longitude: number } | null = null;
  private currentCoordinates: { latitude: number; longitude: number } | null = null;
  private currentBearingToOrigin: number = 42;
  private distanceToOriginMeters: number = 840;

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

    // Load any existing session breadcrumbs
    try {
      const saved = localStorage.getItem('trailscribe_breadcrumbs');
      if (saved) this.breadcrumbs = JSON.parse(saved);
      const originSaved = localStorage.getItem('trailscribe_trailhead');
      if (originSaved) this.trailheadOrigin = JSON.parse(originSaved);
    } catch {}
  }

  render(): void {
    const minutes = Math.floor(this.elapsedSeconds / 60);
    const progressArc = Math.min(100, Math.round((minutes / 45) * 100));

    const lat = this.currentCoordinates?.latitude || this.trailheadOrigin?.latitude || 19.0438;
    const lon = this.currentCoordinates?.longitude || this.trailheadOrigin?.longitude || 73.0674;
    const ephem = SolarEphemerisCalculator.calculate(lat, lon);

    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-28 view-enter">
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

          <!-- Offline Backtrack to Trailhead Compass HUD -->
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline/60 flex items-center justify-between gap-space-md" id="backtrack-hud-card">
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border-2 border-outline-hairline/80 shadow-inner shrink-0">
                <span class="absolute top-0.5 text-[7px] font-mono font-bold text-secondary">N</span>
                <span class="material-symbols-outlined text-primary text-[24px] transition-transform duration-500 ease-out" id="backtrack-needle" style="transform: rotate(${this.currentBearingToOrigin}deg);">navigation</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-[9.5px] font-mono uppercase tracking-wider text-tertiary-fixed-dim font-bold">BACKTRACK TRAILHEAD</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <span class="font-title-md text-title-md text-primary font-bold truncate leading-tight mt-0.5" id="backtrack-dist-label">${this.distanceToOriginMeters}m to Trailhead</span>
                <span class="text-[11px] text-on-surface-variant font-mono truncate" id="backtrack-bearing-label">Bearing: ${String(Math.round(this.currentBearingToOrigin)).padStart(3, '0')}° NE • Direct line</span>
              </div>
            </div>
            <button id="open-backtrack-map-btn" class="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-card-subtle hover:bg-surface-container text-primary text-xs font-semibold border border-outline-hairline/60 active:scale-95 transition-all cursor-pointer shadow-sm" title="Show Trail Breadcrumbs on Map">
              <span class="material-symbols-outlined text-[15px] text-secondary">route</span>
              <span>Trail</span>
            </button>
          </div>

          <!-- Wilderness Solar Ephemeris & Dusk Countdown HUD (Ranger Dave O'Connor SAR Feature) -->
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline/60 flex flex-col gap-2.5 transition-all" id="ephemeris-hud-card">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-9 h-9 rounded-full bg-amber-container text-amber-on-container flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[20px]" id="ephem-icon">${ephem.iconName}</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-[9.5px] font-mono uppercase tracking-wider text-tertiary-fixed-dim font-bold">SOLAR EPHEMERIS · DUSK GAUGE</span>
                  <span class="font-title-md text-title-md text-primary font-bold truncate leading-tight mt-0.5" id="ephem-remaining-label">
                    ${ephem.remainingMinutes > 0 ? `${ephem.remainingHoursText} to Sunset` : ephem.remainingHoursText}
                  </span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-surface-card-subtle border border-outline-hairline/60 text-secondary shrink-0" id="ephem-status-badge">
                ${ephem.statusBadge}
              </span>
            </div>

            <!-- Daylight Progress Horizon -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                <span>06:15 Dawn</span>
                <span class="font-bold text-primary" id="ephem-sunset-label">Sunset ${ephem.sunsetTimeString}</span>
                <span id="ephem-dusk-label">Dusk ${ephem.civilDuskTimeString}</span>
              </div>
              <div class="w-full bg-surface-container rounded-full h-2 overflow-hidden relative border border-outline-hairline/40">
                <div id="ephem-progress-bar" class="h-full rounded-full transition-all duration-500 ${
                  ephem.isUrgentAlert ? 'bg-amber-600' : 'bg-primary'
                }" style="width: ${ephem.daylightElapsedPercent}%;"></div>
              </div>
            </div>

            <!-- SAR Proximity Alert Banner (<45m daylight remaining or after dark) -->
            <div id="ephem-alert-box" class="${ephem.isUrgentAlert ? 'flex' : 'hidden'} items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-950/80 text-amber-200 border border-amber-600/60 text-[11px]">
              <span class="material-symbols-outlined text-[16px] text-amber-400 shrink-0 animate-pulse">warning</span>
              <span id="ephem-alert-msg" class="leading-tight font-medium">${ephem.alertMessage}</span>
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
            <h2 class="text-lg font-semibold text-primary max-w-[280px] leading-tight mb-space-xs font-serif">
              Find Something Blue
            </h2>
            <p class="text-xs italic font-serif text-secondary mb-space-md">
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
            <button class="w-full h-12 rounded-lg bg-primary-container text-vellum-bg font-title-md text-title-md shadow-md active:bg-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs cursor-pointer ambient-glow" id="spotted-btn">
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

    // Start timer interval for live sunlight bath, ephemeris ticker and tracking
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

      // Refresh Ephemeris solar countdown every 10 seconds
      if (this.elapsedSeconds % 10 === 0) {
        this.updateEphemerisUi();
      }

      // Tactile Geofencing proximity audit every 4 seconds
      if (Date.now() - this.lastGeofenceCheck > 4000) {
        this.lastGeofenceCheck = Date.now();
        this.checkProximityGeofencing();
      }
    }, 1000);

    // Refresh GPS coordinates with hardware query
    this.refreshGpsTelemetry(false);
    this.checkProximityGeofencing();
    this.updateEphemerisUi();
  }

  private haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async checkProximityGeofencing(): Promise<void> {
    try {
      const coords = await GeoLocationTracker.getCurrentPosition(false);
      const observations = await db.getAllObservations();

      for (const obs of observations) {
        if (!obs.coordinates) continue;
        const dist = this.haversineMeters(
          coords.latitude,
          coords.longitude,
          obs.coordinates.latitude,
          obs.coordinates.longitude
        );

        // When active coordinates come within 50 meters of a recorded observation
        if (dist <= 50 && !this.triggeredGeofences.has(obs.id)) {
          this.triggeredGeofences.add(obs.id);
          this.fireTactileGeofenceAlert(obs.commonName || 'Field Observation', Math.round(dist));
          break;
        }
      }
    } catch (e) {
      // Quiet recovery for background sensor polling
    }
  }

  private fireTactileGeofenceAlert(commonName: string, meters: number): void {
    // Fire physical haptic feedback pattern: 80ms buzz, 40ms pause, 80ms buzz
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch {
        // Haptics permission or platform unsupported
      }
    }

    AudioFeedback.playTone('save');

    // Surface subtle notification toast
    let toast = this.container.querySelector('#geofence-alert-toast') as HTMLElement;
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'geofence-alert-toast';
      toast.className = 'fixed top-14 inset-x-4 z-50 transition-all duration-300 transform -translate-y-4 opacity-0 pointer-events-none max-w-sm mx-auto';
      this.container.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="bg-primary text-vellum-bg px-3.5 py-2.5 rounded-xl shadow-2xl border border-tertiary-fixed-dim/40 flex items-center gap-3 backdrop-blur-md">
        <div class="w-8 h-8 rounded-full bg-amber-container text-amber-on-container flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[18px]">explore</span>
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-tertiary-fixed-dim font-bold">Tactile Geofence · ${meters}m</span>
          <span class="text-xs font-semibold truncate leading-tight">Entering habitat sector of ${commonName}</span>
        </div>
      </div>
    `;

    // Slide in
    requestAnimationFrame(() => {
      toast.classList.remove('-translate-y-4', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.add('-translate-y-4', 'opacity-0', 'pointer-events-none');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 4500);
  }

  private async refreshGpsTelemetry(forceFresh = false): Promise<void> {
    try {
      const coords = await GeoLocationTracker.getCurrentPosition(forceFresh);
      this.currentCoordinates = { latitude: coords.latitude, longitude: coords.longitude };
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

      // Breadcrumb recording & Trailhead anchor
      if (!this.trailheadOrigin) {
        this.trailheadOrigin = { latitude: coords.latitude, longitude: coords.longitude };
        try {
          localStorage.setItem('trailscribe_trailhead', JSON.stringify(this.trailheadOrigin));
        } catch {}
      }

      // Add to breadcrumb trail if sufficiently distant from last point
      const lastPoint = this.breadcrumbs[this.breadcrumbs.length - 1];
      const shouldPush = !lastPoint || this.haversineMeters(lastPoint.latitude, lastPoint.longitude, coords.latitude, coords.longitude) >= 8;

      if (shouldPush) {
        this.breadcrumbs.push({
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: Date.now()
        });
        try {
          localStorage.setItem('trailscribe_breadcrumbs', JSON.stringify(this.breadcrumbs));
        } catch {}
      }

      // Compute line-of-sight bearing & distance back to Trailhead origin
      if (this.trailheadOrigin) {
        const dist = this.haversineMeters(coords.latitude, coords.longitude, this.trailheadOrigin.latitude, this.trailheadOrigin.longitude);
        this.distanceToOriginMeters = Math.max(10, Math.round(dist));
        this.currentBearingToOrigin = this.calculateBearing(coords.latitude, coords.longitude, this.trailheadOrigin.latitude, this.trailheadOrigin.longitude);
        this.updateBacktrackUi();
      }

      // Update solar ephemeris with updated coordinates
      this.updateEphemerisUi();
    } catch {
      const sourceLabel = this.container.querySelector('#gps-source-label');
      if (sourceLabel) sourceLabel.textContent = 'Searching for Satellites...';
    }
  }

  private updateEphemerisUi(): void {
    const lat = this.currentCoordinates?.latitude || this.trailheadOrigin?.latitude || 19.0438;
    const lon = this.currentCoordinates?.longitude || this.trailheadOrigin?.longitude || 73.0674;
    const ephem = SolarEphemerisCalculator.calculate(lat, lon);

    const icon = this.container.querySelector('#ephem-icon');
    const remainingLabel = this.container.querySelector('#ephem-remaining-label');
    const statusBadge = this.container.querySelector('#ephem-status-badge');
    const sunsetLabel = this.container.querySelector('#ephem-sunset-label');
    const duskLabel = this.container.querySelector('#ephem-dusk-label');
    const progressBar = this.container.querySelector('#ephem-progress-bar') as HTMLElement | null;
    const alertBox = this.container.querySelector('#ephem-alert-box');
    const alertMsg = this.container.querySelector('#ephem-alert-msg');

    if (icon) icon.textContent = ephem.iconName;
    if (remainingLabel) {
      remainingLabel.textContent = ephem.remainingMinutes > 0
        ? `${ephem.remainingHoursText} to Sunset`
        : ephem.remainingHoursText;
    }
    if (statusBadge) statusBadge.textContent = ephem.statusBadge;
    if (sunsetLabel) sunsetLabel.textContent = `Sunset ${ephem.sunsetTimeString}`;
    if (duskLabel) duskLabel.textContent = `Dusk ${ephem.civilDuskTimeString}`;
    if (progressBar) {
      progressBar.style.width = `${ephem.daylightElapsedPercent}%`;
      progressBar.className = `h-full rounded-full transition-all duration-500 ${
        ephem.isUrgentAlert ? 'bg-amber-600' : 'bg-primary'
      }`;
    }
    if (alertBox && alertMsg) {
      alertMsg.textContent = ephem.alertMessage;
      if (ephem.isUrgentAlert) {
        alertBox.classList.remove('hidden');
        alertBox.classList.add('flex');
      } else {
        alertBox.classList.add('hidden');
        alertBox.classList.remove('flex');
      }
    }
  }

  private calculateBearing(fromLat: number, fromLon: number, toLat: number, toLon: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;
    const phi1 = toRad(fromLat);
    const phi2 = toRad(toLat);
    const deltaLambda = toRad(toLon - fromLon);
    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    const brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  }

  private updateBacktrackUi(): void {
    const needle = this.container.querySelector('#backtrack-needle') as HTMLElement | null;
    const distLabel = this.container.querySelector('#backtrack-dist-label');
    const bearingLabel = this.container.querySelector('#backtrack-bearing-label');

    if (needle) {
      needle.style.transform = `rotate(${Math.round(this.currentBearingToOrigin)}deg)`;
    }
    if (distLabel) {
      const distStr = this.distanceToOriginMeters >= 1000
        ? `${(this.distanceToOriginMeters / 1000).toFixed(2)} km`
        : `${this.distanceToOriginMeters}m`;
      distLabel.textContent = `${distStr} to Trailhead`;
    }
    if (bearingLabel) {
      const cardinal = this.getCardinalDirection(this.currentBearingToOrigin);
      bearingLabel.textContent = `Bearing: ${String(Math.round(this.currentBearingToOrigin)).padStart(3, '0')}° ${cardinal} • Direct line`;
    }
  }

  private getCardinalDirection(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(bearing / 45) % 8;
    return directions[idx];
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

    const openBacktrackBtn = this.container.querySelector('#open-backtrack-map-btn');
    openBacktrackBtn?.addEventListener('click', () => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([40, 20, 40]); } catch {}
      }
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
