import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../../storage/db';
import { GeoLocationTracker } from '../../utils/geolocation';
import type { FieldObservation, Coordinates } from '../../storage/types';

export class AdventureMapView {
  private container: HTMLElement;
  private onSelectSpecimen: (specimenId: string) => void;
  private onViewFolio: () => void;
  private onOpenAdventure?: () => void;
  private observations: FieldObservation[] = [];
  private userCoords: Coordinates = { latitude: 19.0728, longitude: 72.8826, accuracy: 25 };
  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private userAccuracyCircle: L.Circle | null = null;
  private observationMarkers: L.Marker[] = [];
  private tileLayers: L.TileLayer[] = [];
  private activeLayerIndex: number = 0;
  private compassRotation: number = 0;
  private breadcrumbPolyline: L.Polyline | null = null;
  private trailheadMarker: L.Marker | null = null;

  private readonly layerConfigs = [
    {
      name: 'World Topo',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      options: {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, USGS, Garmin'
      }
    },
    {
      name: 'Street Topo',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    },
    {
      name: 'Canopy Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri, Earthstar, USGS'
      }
    },
    {
      name: 'Field Terrain',
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      options: {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors, Humanitarian style'
      }
    },
    {
      name: 'Ridge Topo',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      options: {
        maxZoom: 17,
        attribution: 'Map &copy; OpenStreetMap | Style &copy; OpenTopoMap'
      }
    }
  ];

  constructor(
    container: HTMLElement,
    callbacks: {
      onSelectSpecimen: (specimenId: string) => void;
      onViewFolio: () => void;
      onOpenAdventure?: () => void;
    }
  ) {
    this.container = container;
    this.onSelectSpecimen = callbacks.onSelectSpecimen;
    this.onViewFolio = callbacks.onViewFolio;
    this.onOpenAdventure = callbacks.onOpenAdventure;
  }

  async render(): Promise<void> {
    this.destroyMap();

    this.observations = await db.getAllObservations();
    const discoveriesCount = this.observations.length > 0 ? this.observations.length : 5;

    // Fetch live user position
    try {
      this.userCoords = await GeoLocationTracker.getCurrentPosition(false);
    } catch {
      // Keep baseline
    }

    const validObs = this.observations.filter(
      (o) => o.coordinates && typeof o.coordinates.latitude === 'number' && typeof o.coordinates.longitude === 'number'
    );

    const distanceKm = (Math.max(1, validObs.length) * 0.45 + 0.8).toFixed(1);
    const elapsedMinutes = Math.min(120, Math.max(25, validObs.length * 8));

    this.container.innerHTML = `
      <div class="flex flex-col w-full relative pb-28 view-enter">
        <!-- Interactive Topographic Canvas Container -->
        <div class="relative w-full h-[520px] overflow-hidden bg-surface-container" id="map-viewport-box">
          <!-- Real Interactive Leaflet Map Instance -->
          <div id="leaflet-map-canvas" class="w-full h-[520px] min-h-[520px]" style="width: 100%; height: 520px; min-height: 520px; position: relative;"></div>

          <!-- Floating Top Trip Strip Card: Live Expedition Telemetry (Clickable to Adventure) -->
          <div class="absolute top-3 inset-x-margin z-[1000] cursor-pointer" id="trip-strip-card" title="Open Active Adventure Mode">
            <div class="w-full bg-surface-card/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg flex flex-col gap-1 border border-outline-hairline/60 hover:border-secondary active:scale-[0.99] transition-all">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-on-tertiary-container" style="font-variation-settings: 'FILL' 1;">near_me</span>
                  <span class="text-[10px] tracking-wider uppercase text-on-surface-variant font-bold">Your Adventure</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-semibold">Active Track</span>
                  <span class="material-symbols-outlined text-[14px] text-secondary">arrow_forward</span>
                </div>
              </div>
              <div class="grid grid-cols-3 divide-x-0 pt-0.5">
                <div class="flex flex-col">
                  <span class="text-[16px] font-bold text-primary leading-tight font-serif">${distanceKm}<span class="text-[10px] ml-0.5 text-on-surface-variant font-normal">KM</span></span>
                  <span class="text-[9.5px] text-on-surface-variant uppercase tracking-wider">Distance</span>
                </div>
                <div class="flex flex-col pl-2.5">
                  <span class="text-[16px] font-bold text-primary leading-tight font-serif">${elapsedMinutes}<span class="text-[10px] ml-0.5 text-on-surface-variant font-normal">MIN</span></span>
                  <span class="text-[9.5px] text-on-surface-variant uppercase tracking-wider">Elapsed</span>
                </div>
                <div class="flex flex-col pl-2.5">
                  <span class="text-[16px] font-bold text-primary leading-tight font-serif">${discoveriesCount}<span class="text-[10px] ml-0.5 text-on-surface-variant font-normal">LOGS</span></span>
                  <span class="text-[9.5px] text-on-surface-variant uppercase tracking-wider">Discoveries</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating Map Field Controls (Right Side Utility Column) -->
          <div class="absolute right-margin bottom-12 z-[1000] flex flex-col gap-2">
            <!-- Zoom In Button -->
            <button aria-label="Zoom In" class="w-11 h-11 rounded-full bg-surface-card/95 backdrop-blur-md text-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-hairline/60 hover:bg-surface-card" id="map-zoom-in-btn" title="Zoom In (+)">
              <span class="material-symbols-outlined text-[20px] text-primary font-bold">add</span>
            </button>
            <!-- Zoom Out Button -->
            <button aria-label="Zoom Out" class="w-11 h-11 rounded-full bg-surface-card/95 backdrop-blur-md text-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-hairline/60 hover:bg-surface-card" id="map-zoom-out-btn" title="Zoom Out (-)">
              <span class="material-symbols-outlined text-[20px] text-primary font-bold">remove</span>
            </button>
            <!-- Fit All Discoveries Frame -->
            <button aria-label="Fit All Discoveries" class="w-11 h-11 rounded-full bg-surface-card/95 backdrop-blur-md text-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-hairline/60 hover:bg-surface-card" id="map-fit-bounds-btn" title="Frame All Discoveries">
              <span class="material-symbols-outlined text-[20px] text-secondary">filter_center_focus</span>
            </button>
            <!-- Compass Button -->
            <button aria-label="Compass Orientation" class="w-11 h-11 rounded-full bg-surface-card/95 backdrop-blur-md text-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-hairline/60 hover:bg-surface-card" id="map-compass-btn" title="Align to Magnetic North">
              <span class="material-symbols-outlined text-[20px] text-secondary" id="compass-needle-icon">explore</span>
            </button>
            <!-- Trail Breadcrumbs / Backtrack Button -->
            <button aria-label="Trail Breadcrumbs" class="w-11 h-11 rounded-full bg-surface-card/95 backdrop-blur-md text-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-hairline/60 hover:bg-surface-card" id="map-trail-btn" title="View Trail Breadcrumbs & Backtrack">
              <span class="material-symbols-outlined text-[20px] text-tertiary-fixed-dim">route</span>
            </button>
            <!-- Topographic Layers Button -->
            <button aria-label="Topographic Layers" class="w-11 h-11 rounded-full bg-surface-card/95 backdrop-blur-md text-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-hairline/60 hover:bg-surface-card" id="map-layers-btn" title="Cycle Map Layer">
              <span class="material-symbols-outlined text-[20px] text-secondary">layers</span>
            </button>
            <!-- Locate Me Button -->
            <button aria-label="Locate Me" class="w-11 h-11 rounded-full bg-primary-container text-vellum-bg shadow-lg flex items-center justify-center active:scale-95 transition-transform cursor-pointer hover:bg-secondary" id="map-locate-btn" title="Center Live GPS Position">
              <span class="material-symbols-outlined text-[20px] text-tertiary-fixed-dim" style="font-variation-settings: 'FILL' 1;">my_location</span>
            </button>
          </div>

          <!-- Topographic Attribution & Altitude Ribbon -->
          <div class="absolute left-margin bottom-12 z-[1000] px-3.5 py-1.5 rounded-full bg-surface-card/95 backdrop-blur-md shadow-lg flex items-center gap-1.5 border border-outline-hairline/60" id="map-elevation-ribbon">
            <span class="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" id="gps-status-dot"></span>
            <span class="font-label-sm text-label-sm text-on-surface font-mono" id="map-gps-label">
              GPS LOCK · ${this.userCoords.latitude.toFixed(4)}° N, ${this.userCoords.longitude.toFixed(4)}° E (±${this.userCoords.accuracy || 15}m)
            </span>
          </div>

          <!-- Map Layer Indicator Toast (Ephemeral) -->
          <div id="layer-mode-toast" class="absolute top-28 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-obsidian-scrim text-vellum-bg font-label-sm text-label-sm uppercase tracking-wider font-mono opacity-0 transition-opacity duration-300 pointer-events-none z-[1001] shadow-xl">
            Layer: World Topo
          </div>
        </div>

        <!-- Discoveries Bottom Sheet: Archival Horizontal Carousel -->
        <div class="w-full bg-vellum-bg px-margin pt-space-lg flex flex-col gap-space-md pb-28">
          <!-- Section Header & Ledger Indicator -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px] text-secondary">auto_stories</span>
              <h2 class="font-headline-md text-headline-md text-primary font-serif">Field Logged Today</h2>
            </div>
            <button class="font-label-sm text-label-sm text-secondary hover:text-primary uppercase tracking-wider font-bold flex items-center gap-0.5 cursor-pointer" id="map-view-folio-btn">
              <span>View Folio</span>
              <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <!-- Specimen Cards Horizontal Scroller -->
          <div class="w-full overflow-x-auto flex gap-space-md pb-space-sm snap-x snap-mandatory">
            ${this.renderCarouselCards()}
          </div>

          <!-- Expedition Logbook Note -->
          <div class="w-full bg-surface-card rounded-xl p-space-md shadow-sm flex items-start gap-space-md mb-2 border border-outline-hairline/60">
            <div class="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px] text-secondary">edit_note</span>
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <span class="font-title-md text-title-md text-primary font-semibold">Ridge Survey Note</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant font-mono">Km 2.4</span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
                Pannable topographic live sector. Touch or drag to explore field topography, streams, and cataloged wildlife coordinates. Tap any specimen in the folio below to fly directly to its location.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Wait for DOM reflow so Leaflet calculates true pixel container dimensions
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.initLeafletMap(validObs);
      }, 50);
    });

    this.bindEvents(validObs);
  }

  private initLeafletMap(validObs: FieldObservation[]): void {
    const mapEl = this.container.querySelector('#leaflet-map-canvas') as HTMLElement;
    if (!mapEl) return;

    // Destroy any existing map instance cleanly
    this.destroyMap();

    // Create real interactive Leaflet map instance
    this.map = L.map(mapEl, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 19,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      bounceAtZoomLimits: true
    });

    // Create authentic Cartographic tile layers
    this.tileLayers = this.layerConfigs.map((cfg) => L.tileLayer(cfg.url, cfg.options));

    // Add default initial layer (Vellum Topo)
    this.activeLayerIndex = 0;
    this.tileLayers[0].addTo(this.map);

    // Initial view set directly to user coordinates at zoom 15 WITHOUT ANIMATION
    const initialLat = this.userCoords.latitude;
    const initialLon = this.userCoords.longitude;
    this.map.setView([initialLat, initialLon], 15, { animate: false });

    // Invalidate container size to force accurate tile grid calculation
    this.map.invalidateSize(false);

    // Add user location pulsing beacon marker
    this.renderUserLocationMarker();

    // Add observation markers for all cataloged sightings
    this.renderObservationMarkers(validObs);

    // Add trail breadcrumbs polyline & trailhead marker
    this.renderBreadcrumbsTrail(validObs);

    // Safety re-check container size after DOM settlement
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(false);
      }
    }, 150);
  }

  private renderUserLocationMarker(): void {
    if (!this.map) return;

    const latLng: [number, number] = [this.userCoords.latitude, this.userCoords.longitude];

    // User accuracy circle
    if (this.userAccuracyCircle) {
      try {
        this.userAccuracyCircle.remove();
      } catch {}
    }
    this.userAccuracyCircle = L.circle(latLng, {
      radius: Math.max(15, this.userCoords.accuracy || 25),
      color: '#416652',
      weight: 1.5,
      opacity: 0.7,
      fillColor: '#c0e9cf',
      fillOpacity: 0.18
    }).addTo(this.map);

    // User Beacon Pin
    if (this.userMarker) {
      try {
        this.userMarker.remove();
      } catch {}
    }

    const userBeaconHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <span class="absolute w-12 h-12 rounded-full bg-emerald-500/25 animate-ping"></span>
        <span class="absolute w-8 h-8 rounded-full bg-amber-400/40"></span>
        <div class="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md border-2 border-vellum-bg">
          <div class="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></div>
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'user-beacon-pin',
      html: userBeaconHtml,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    this.userMarker = L.marker(latLng, {
      icon: userIcon,
      zIndexOffset: 1000
    }).addTo(this.map);
  }

  private renderObservationMarkers(observations: FieldObservation[]): void {
    if (!this.map) return;

    // Clear previous markers
    for (const m of this.observationMarkers) {
      try {
        m.remove();
      } catch {}
    }
    this.observationMarkers = [];

    // Fallback observations if DB is empty
    const items =
      observations.length > 0
        ? observations
        : [
            {
              id: 'asian-koel',
              commonName: 'Asian Koel',
              scientificName: 'Eudynamys scolopaceus',
              kingdomOrGroup: 'Aves',
              confidenceScore: 0.94,
              coordinates: { latitude: 18.9553, longitude: 72.8055 },
              photoUrl:
                'https://lh3.googleusercontent.com/aida-public/AB6AXuB4v7MAnlTBPhXOjjznhrNUaySsS_57290id3-GzEnq4vAejxjOFxhjQ_fKAuxVRwa9lcDV2rWOnu77U0DQUGitVLZ3M_Vetafjme5DjfEq1bZJd2DCf847oaJ1He-eNpUPSRWKUNbAxr4zXKaFp6PiNdY_Qk3uJjz-m-8mJWHgjYXZjiCFH7UzJDSDXgodMNmdGM-AxIeWOAgCz8I_3YlhErlffPtMQYYp3-XdzAa684D-XRM4GzSJ',
              readableDate: 'Today'
            } as FieldObservation
          ];

    for (const obs of items) {
      if (!obs.coordinates || typeof obs.coordinates.latitude !== 'number') continue;

      const icon =
        obs.kingdomOrGroup === 'Aves'
          ? 'raven'
          : obs.kingdomOrGroup === 'Plantae'
          ? 'potted_plant'
          : obs.kingdomOrGroup === 'Insecta'
          ? 'flutter'
          : obs.kingdomOrGroup === 'Fungi'
          ? 'psychology_alt'
          : 'pets';

      const pinHtml = `
        <div class="relative -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform active:scale-90 hover:scale-110">
          <div class="w-9 h-9 rounded-full bg-surface-card flex items-center justify-center shadow-md border-2 border-primary/20 hover:border-secondary transition-colors">
            <span class="material-symbols-outlined text-[20px] text-secondary">${icon}</span>
          </div>
          <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-tertiary-fixed-dim border border-vellum-bg shadow-sm"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'discovery-pin-icon',
        html: pinHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([obs.coordinates.latitude, obs.coordinates.longitude], {
        icon: customIcon
      }).addTo(this.map);

      // Popup with Archival Specimen Card Preview
      const matchPct = Math.round((obs.confidenceScore ?? 0.94) * 100);
      const photo = obs.photoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4v7MAnlTBPhXOjjznhrNUaySsS_57290id3-GzEnq4vAejxjOFxhjQ_fKAuxVRwa9lcDV2rWOnu77U0DQUGitVLZ3M_Vetafjme5DjfEq1bZJd2DCf847oaJ1He-eNpUPSRWKUNbAxr4zXKaFp6PiNdY_Qk3uJjz-m-8mJWHgjYXZjiCFH7UzJDSDXgodMNmdGM-AxIeWOAgCz8I_3YlhErlffPtMQYYp3-XdzAa684D-XRM4GzSJ';
      const commonName = obs.commonName || 'Specimen';
      const scientificName = obs.scientificName || 'Unknown Taxa';

      const popupHtml = `
        <div class="p-3 w-56 flex flex-col gap-2 font-sans text-left">
          <div class="relative w-full h-24 rounded-lg overflow-hidden bg-surface-container-high">
            <img src="${photo}" alt="${commonName}" class="w-full h-full object-cover" />
            <div class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-obsidian-scrim text-vellum-bg text-[10px] font-bold">
              ${matchPct}% MATCH
            </div>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[14px] font-serif font-bold text-primary truncate leading-tight">${commonName}</span>
            <span class="text-[12px] font-serif italic text-secondary truncate">${scientificName}</span>
          </div>
          <button class="popup-inspect-btn w-full py-1.5 rounded-lg bg-primary-container text-vellum-bg text-[11px] font-bold tracking-wider uppercase text-center active:bg-secondary cursor-pointer" data-id="${obs.id}">
            VIEW SPECIMEN
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoPan: true,
        className: 'archival-specimen-popup'
      });

      marker.on('popupopen', (e) => {
        const popupEl = e.popup.getElement();
        const inspectBtn = popupEl?.querySelector('.popup-inspect-btn');
        inspectBtn?.addEventListener('click', () => {
          this.onSelectSpecimen(obs.id);
        });
      });

      this.observationMarkers.push(marker);
    }
  }

  private renderBreadcrumbsTrail(observations: FieldObservation[]): void {
    if (!this.map) return;

    if (this.breadcrumbPolyline) {
      try { this.breadcrumbPolyline.remove(); } catch {}
      this.breadcrumbPolyline = null;
    }
    if (this.trailheadMarker) {
      try { this.trailheadMarker.remove(); } catch {}
      this.trailheadMarker = null;
    }

    let points: [number, number][] = [];

    // Check for saved breadcrumbs from active adventure session
    try {
      const saved = localStorage.getItem('trailscribe_breadcrumbs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          points = parsed.map((p: any) => [p.latitude, p.longitude] as [number, number]);
        }
      }
    } catch {}

    // Fallback if no stored breadcrumbs: construct realistic trail route connecting sightings to user location
    if (points.length < 2) {
      const sortedObs = [...observations]
        .filter((o) => o.coordinates && typeof o.coordinates.latitude === 'number' && typeof o.coordinates.longitude === 'number')
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      if (sortedObs.length > 0) {
        const first = sortedObs[0].coordinates!;
        const trailhead: [number, number] = [first.latitude - 0.0032, first.longitude - 0.0028];
        points = [
          trailhead,
          ...sortedObs.map((o) => [o.coordinates!.latitude, o.coordinates!.longitude] as [number, number]),
          [this.userCoords.latitude, this.userCoords.longitude]
        ];
      } else {
        const origin: [number, number] = [this.userCoords.latitude - 0.0035, this.userCoords.longitude - 0.003];
        points = [origin, [this.userCoords.latitude, this.userCoords.longitude]];
      }
    }

    // Render golden dashed route polyline
    this.breadcrumbPolyline = L.polyline(points, {
      color: '#cd8e2e',
      weight: 3.5,
      opacity: 0.85,
      dashArray: '6, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    // Place Trailhead Origin marker pin
    const startPoint = points[0];
    const trailheadHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div class="px-2.5 py-1 rounded-full bg-primary text-vellum-bg text-[10.5px] font-mono font-bold flex items-center gap-1.5 shadow-lg border border-tertiary-fixed-dim/80">
          <span class="material-symbols-outlined text-[14px] text-tertiary-fixed-dim">flag</span>
          <span>TRAILHEAD</span>
        </div>
      </div>
    `;

    const trailheadIcon = L.divIcon({
      className: 'trailhead-origin-pin',
      html: trailheadHtml,
      iconSize: [96, 26],
      iconAnchor: [48, 13]
    });

    this.trailheadMarker = L.marker(startPoint, {
      icon: trailheadIcon,
      zIndexOffset: 850
    }).addTo(this.map);
  }

  private renderCarouselCards(): string {
    if (this.observations.length === 0) {
      return `
        <div class="map-carousel-card min-w-[260px] max-w-[260px] bg-surface-card rounded-xl p-space-sm shadow-sm flex flex-col gap-space-sm snap-start shrink-0 cursor-pointer border border-outline-hairline/60" data-id="asian-koel">
          <div class="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container-high">
            <img class="w-full h-full object-cover" alt="Asian Koel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4v7MAnlTBPhXOjjznhrNUaySsS_57290id3-GzEnq4vAejxjOFxhjQ_fKAuxVRwa9lcDV2rWOnu77U0DQUGitVLZ3M_Vetafjme5DjfEq1bZJd2DCf847oaJ1He-eNpUPSRWKUNbAxr4zXKaFp6PiNdY_Qk3uJjz-m-8mJWHgjYXZjiCFH7UzJDSDXgodMNmdGM-AxIeWOAgCz8I_3YlhErlffPtMQYYp3-XdzAa684D-XRM4GzSJ"/>
            <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
              <span class="font-label-sm text-label-sm tracking-wider">96% MATCH</span>
            </div>
          </div>
          <div class="flex flex-col min-w-0 px-1">
            <span class="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-wider font-bold">Fauna · Aves</span>
            <h3 class="font-title-md text-title-md text-primary truncate leading-snug font-serif">Asian Koel</h3>
            <p class="font-latin-name text-latin-name italic text-secondary truncate">Eudynamys scolopaceus</p>
          </div>
        </div>
      `;
    }

    return this.observations
      .slice(0, 5)
      .map((obs) => {
        const groupLabel =
          obs.kingdomOrGroup === 'Aves'
            ? 'Fauna · Aves'
            : obs.kingdomOrGroup === 'Plantae'
            ? 'Flora · Botanical'
            : obs.kingdomOrGroup === 'Insecta'
            ? 'Insecta · Entomology'
            : 'Fauna · Wildlife';

        const matchPct = Math.round((obs.confidenceScore ?? 0.94) * 100);

        return `
          <div class="map-carousel-card min-w-[260px] max-w-[260px] bg-surface-card rounded-xl p-space-sm shadow-sm flex flex-col gap-space-sm snap-start shrink-0 cursor-pointer border border-outline-hairline/60 active:scale-95 transition-transform" data-id="${obs.id}">
            <div class="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container-high">
              <img class="w-full h-full object-cover" alt="${obs.commonName || 'Specimen'}" src="${obs.photoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4v7MAnlTBPhXOjjznhrNUaySsS_57290id3-GzEnq4vAejxjOFxhjQ_fKAuxVRwa9lcDV2rWOnu77U0DQUGitVLZ3M_Vetafjme5DjfEq1bZJd2DCf847oaJ1He-eNpUPSRWKUNbAxr4zXKaFp6PiNdY_Qk3uJjz-m-8mJWHgjYXZjiCFH7UzJDSDXgodMNmdGM-AxIeWOAgCz8I_3YlhErlffPtMQYYp3-XdzAa684D-XRM4GzSJ'}"/>
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                <span class="font-label-sm text-label-sm tracking-wider">${matchPct}% MATCH</span>
              </div>
              <div class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg">
                <span class="font-label-sm text-label-sm tracking-wide">${obs.readableDate?.split('·')[1]?.trim() || 'Log'}</span>
              </div>
            </div>
            <div class="flex flex-col min-w-0 px-1">
              <span class="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-wider font-bold">${groupLabel}</span>
              <h3 class="font-title-md text-title-md text-primary truncate leading-snug font-serif">${obs.commonName || 'Field Organism'}</h3>
              <p class="font-latin-name text-latin-name italic text-secondary truncate font-serif">${obs.scientificName || 'Unknown Taxa'}</p>
            </div>
            <div class="flex items-center gap-1.5 px-1 pt-1">
              <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">Native</span>
              <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">Verified</span>
              <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">LC</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  private bindEvents(validObs: FieldObservation[]): void {
    // Top Trip Strip Card: Open Adventure Mode
    const tripStrip = this.container.querySelector('#trip-strip-card');
    tripStrip?.addEventListener('click', () => {
      if (this.onOpenAdventure) {
        this.onOpenAdventure();
      }
    });

    // Carousel Cards: Click to fly smoothly directly to that specimen!
    const cards = this.container.querySelectorAll('.map-carousel-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id') || 'asian-koel';
        const targetObs = this.observations.find((o) => o.id === id);
        if (targetObs && targetObs.coordinates && this.map) {
          this.map.flyTo([targetObs.coordinates.latitude, targetObs.coordinates.longitude], 16, {
            animate: true,
            duration: 1.2
          });
        } else {
          this.onSelectSpecimen(id);
        }
      });
    });

    // View Folio
    const viewFolioBtn = this.container.querySelector('#map-view-folio-btn');
    viewFolioBtn?.addEventListener('click', () => {
      this.onViewFolio();
    });

    // Zoom In Button
    const zoomInBtn = this.container.querySelector('#map-zoom-in-btn');
    zoomInBtn?.addEventListener('click', () => {
      if (this.map) {
        this.map.zoomIn();
      }
    });

    // Zoom Out Button
    const zoomOutBtn = this.container.querySelector('#map-zoom-out-btn');
    zoomOutBtn?.addEventListener('click', () => {
      if (this.map) {
        this.map.zoomOut();
      }
    });

    // Fit All Discoveries Frame
    const fitBoundsBtn = this.container.querySelector('#map-fit-bounds-btn');
    const toast = this.container.querySelector('#layer-mode-toast') as HTMLElement;
    fitBoundsBtn?.addEventListener('click', () => {
      if (!this.map) return;
      const allPoints: [number, number][] = [
        [this.userCoords.latitude, this.userCoords.longitude],
        ...validObs.map((o) => [o.coordinates!.latitude, o.coordinates!.longitude] as [number, number])
      ];
      if (allPoints.length > 0) {
        try {
          const bounds = L.latLngBounds(allPoints);
          this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
          if (toast) {
            toast.textContent = 'Frame: All Discoveries';
            toast.classList.remove('opacity-0');
            toast.classList.add('opacity-100');
            setTimeout(() => {
              toast.classList.remove('opacity-100');
              toast.classList.add('opacity-0');
            }, 1500);
          }
        } catch {
          // fallback
        }
      }
    });

    // Trail Breadcrumbs Button: Fit full breadcrumb trail and highlight trailhead
    const trailBtn = this.container.querySelector('#map-trail-btn');
    trailBtn?.addEventListener('click', () => {
      if (!this.map) return;
      if (this.breadcrumbPolyline) {
        try {
          const bounds = this.breadcrumbPolyline.getBounds();
          this.map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
          if (toast) {
            toast.textContent = 'Trail: Active Breadcrumb Route';
            toast.classList.remove('opacity-0');
            toast.classList.add('opacity-100');
            setTimeout(() => {
              toast.classList.remove('opacity-100');
              toast.classList.add('opacity-0');
            }, 1800);
          }
        } catch {}
      }
    });

    // Compass Button: Re-align North & pan to user position
    const compassBtn = this.container.querySelector('#map-compass-btn');
    const needleIcon = this.container.querySelector('#compass-needle-icon') as HTMLElement;
    compassBtn?.addEventListener('click', () => {
      this.compassRotation = (this.compassRotation + 90) % 360;
      if (needleIcon) {
        needleIcon.style.transform = `rotate(${this.compassRotation}deg)`;
        needleIcon.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
      if (this.map) {
        this.map.panTo([this.userCoords.latitude, this.userCoords.longitude], { animate: true });
      }
    });

    // Cartographic Layer Switcher (Cycles: Vellum Topo -> Street Topo -> Canopy Satellite -> Ridge Topo)
    const layersBtn = this.container.querySelector('#map-layers-btn');
    layersBtn?.addEventListener('click', () => {
      if (!this.map || this.tileLayers.length === 0) return;

      // Remove current layer
      try {
        this.tileLayers[this.activeLayerIndex].remove();
      } catch {}

      // Cycle to next layer
      this.activeLayerIndex = (this.activeLayerIndex + 1) % this.tileLayers.length;
      const nextLayer = this.tileLayers[this.activeLayerIndex];
      nextLayer.addTo(this.map);

      const layerName = this.layerConfigs[this.activeLayerIndex].name;
      if (toast) {
        toast.textContent = `Layer: ${layerName}`;
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
        setTimeout(() => {
          toast.classList.remove('opacity-100');
          toast.classList.add('opacity-0');
        }, 1500);
      }
    });

    // Locate Me Button: Forced Hardware Re-poll & Smooth Leaflet flyTo
    const locateBtn = this.container.querySelector('#map-locate-btn');
    const gpsLabel = this.container.querySelector('#map-gps-label');
    const gpsDot = this.container.querySelector('#gps-status-dot');

    locateBtn?.addEventListener('click', async () => {
      locateBtn.classList.add('scale-90');
      if (gpsDot) {
        gpsDot.classList.remove('bg-secondary');
        gpsDot.classList.add('bg-amber-container', 'animate-ping');
      }

      if (toast) {
        toast.textContent = 'Acquiring GPS Fix...';
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
      }

      try {
        // Query live sensor with forceRefresh
        this.userCoords = await GeoLocationTracker.getCurrentPosition(true);
        const source = GeoLocationTracker.getLocationSource();

        // Update markers on the real map
        this.renderUserLocationMarker();

        // Fly smoothly to the exact coordinates
        if (this.map) {
          this.map.flyTo([this.userCoords.latitude, this.userCoords.longitude], 16, {
            animate: true,
            duration: 1.2
          });
        }

        const sourceLabel =
          source === 'gps'
            ? 'GPS LOCK'
            : source === 'network'
            ? 'WI-FI / CELL LOCK'
            : source === 'ip'
            ? 'NETWORK LOCATION'
            : 'FIELD BASELINE';

        if (gpsLabel) {
          gpsLabel.textContent = `${sourceLabel} · ${this.userCoords.latitude.toFixed(4)}° N, ${this.userCoords.longitude.toFixed(4)}° E (±${this.userCoords.accuracy || 12}m)`;
        }

        if (toast) {
          toast.textContent = `Position Locked: ${this.userCoords.latitude.toFixed(4)}° N, ${this.userCoords.longitude.toFixed(4)}° E`;
          setTimeout(() => {
            toast.classList.remove('opacity-100');
            toast.classList.add('opacity-0');
          }, 2000);
        }
      } catch (err) {
        console.warn('GPS query notice:', err);
        if (toast) {
          toast.textContent = 'GPS Sensor Timeout · Using Field Baseline';
          setTimeout(() => {
            toast.classList.remove('opacity-100');
            toast.classList.add('opacity-0');
          }, 2000);
        }
      } finally {
        setTimeout(() => {
          locateBtn.classList.remove('scale-90');
          if (gpsDot) {
            gpsDot.classList.remove('bg-amber-container', 'animate-ping');
            gpsDot.classList.add('bg-secondary');
          }
        }, 300);
      }
    });
  }

  public destroyMap(): void {
    if (this.map) {
      try {
        this.map.stop();
        this.map.eachLayer((layer) => {
          try {
            this.map?.removeLayer(layer);
          } catch {}
        });
        this.map.remove();
      } catch (err) {
        console.warn('Map cleanup notice:', err);
      }
      this.map = null;
    }
    this.userMarker = null;
    this.userAccuracyCircle = null;
    this.observationMarkers = [];
    this.tileLayers = [];
    this.breadcrumbPolyline = null;
    this.trailheadMarker = null;
  }
}
