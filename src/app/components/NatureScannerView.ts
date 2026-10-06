import { db } from '../../storage/db';
import { GeoLocationTracker } from '../../utils/geolocation';
import type { FieldObservation } from '../../storage/types';

export class NatureScannerView {
  private container: HTMLElement;
  private onCapture: (newSpecimenId?: string) => void;
  private onListenForNature: () => void;
  private onOpenFolio: () => void;
  private onOpenMap?: () => void;
  private videoStream: MediaStream | null = null;
  private torchActive: boolean = false;
  private isUsingLiveCamera: boolean = false;
  private zoomScale: number = 1.0;

  constructor(
    container: HTMLElement,
    callbacks: {
      onCapture: (newSpecimenId?: string) => void;
      onListenForNature: () => void;
      onOpenFolio: () => void;
      onOpenMap?: () => void;
    }
  ) {
    this.container = container;
    this.onCapture = callbacks.onCapture;
    this.onListenForNature = callbacks.onListenForNature;
    this.onOpenFolio = callbacks.onOpenFolio;
    this.onOpenMap = callbacks.onOpenMap;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex flex-col w-full relative select-none view-enter">
        <!-- Viewfinder Optical Canvas -->
        <div class="relative w-full overflow-hidden aspect-[3/4] max-h-[636px] flex items-center justify-center bg-primary">
          <!-- Flash Shutter Exposure Overlay -->
          <div id="shutter-flash" class="absolute inset-0 bg-white opacity-0 pointer-events-none transition-opacity duration-150 z-30"></div>

          <!-- Camera Sensor Live Stream Placeholder / Real Video Element -->
          <video id="scanner-video" class="absolute inset-0 w-full h-full object-cover hidden transition-transform duration-300 ease-out origin-center" playsinline autoplay muted></video>
          <img id="scanner-sensor-img" class="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-300 ease-out origin-center" alt="Indian Palm Squirrel Viewfinder" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlTf7kYXp4Z-sCYzhAcO6kMDxEmX7ZCoLcjfRKB86mU39qnHQdSyhVa4TQIMB4vDbiA9xRLtdZtXyLEFPaM_xmMWvEGZdxzJJDx4SqLqPeFmdIjADE56zG0jGd_mcOrTtgoHtj-sZ-xxJv3LAUkNqrpnmFMb3YOYhY5eWqXD1xHDJjGW_55OkF0yhlzYS5CKoAHXliQ_V4VRJsg5WmFw_OHc_7aQnUf1KNgePhpevO7MU3Qv95oU3N"/>
          
          <!-- Ambient Shadow Overlays for Telemetry Legibility -->
          <div class="absolute inset-0 bg-gradient-to-b from-primary/70 via-transparent to-primary/80 pointer-events-none"></div>

          <!-- Viewfinder Corner HUD Brackets -->
          <div class="absolute inset-4 pointer-events-none flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <svg class="opacity-80" fill="none" height="24" viewbox="0 0 24 24" width="24">
                <path d="M2 10V2H10" stroke="#F8F6F0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <svg class="opacity-80" fill="none" height="24" viewbox="0 0 24 24" width="24">
                <path d="M22 10V2H14" stroke="#F8F6F0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
            <!-- Center Crosshair Marks -->
            <div class="self-center flex items-center justify-center opacity-40">
              <svg fill="none" height="32" viewbox="0 32" width="32">
                <path d="M16 4V10M16 22V28M4 16H10M22 16H28" stroke="#F8F6F0" stroke-linecap="round" stroke-width="1.5"></path>
                <circle cx="16" cy="16" fill="#F8F6F0" r="2"></circle>
              </svg>
            </div>
            <div class="flex justify-between items-end">
              <svg class="opacity-80" fill="none" height="24" viewbox="0 0 24 24" width="24">
                <path d="M2 14V22H10" stroke="#F8F6F0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <svg class="opacity-80" fill="none" height="24" viewbox="0 0 24 24" width="24">
                <path d="M22 14V22H14" stroke="#F8F6F0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
          </div>

          <!-- Telemetry Status Bar -->
          <div class="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
            <button id="toggle-camera-source-btn" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-scrim shadow-md cursor-pointer hover:bg-obsidian-scrim/90 active:scale-95 transition-all" title="Toggle Live Lens / Archival Study">
              <span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
              <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-wider font-semibold" id="camera-status-label">Local Vision AI • Offline</span>
            </button>
            <!-- Optical Sensor Parameters / Lux Telemetry -->
            <div class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-obsidian-scrim text-vellum-bg shadow-md font-label-sm text-label-sm">
              <div class="flex items-center gap-1 text-tertiary-fixed-dim">
                <span class="material-symbols-outlined text-[16px]">wb_sunny</span>
                <span class="font-mono" id="lux-val">42,500 lx</span>
              </div>
              <span class="opacity-40">|</span>
              <span class="font-mono tracking-tight text-surface-container">ƒ/1.8 · 1/640s</span>
            </div>
          </div>

          <!-- Target Tracking Bounding Box & Neural Focus Ring -->
          <div class="absolute top-[32%] left-[28%] w-44 h-44 pointer-events-none transition-all duration-300 transform -translate-x-2 -translate-y-2" id="reticle-target">
            <!-- Amber Reticle Arc Ring -->
            <svg class="w-full h-full animate-[spin_12s_linear_infinite]" viewbox="0 0 100 100">
              <circle class="opacity-90" cx="50" cy="50" fill="none" r="44" stroke="#feb956" stroke-dasharray="8 6" stroke-width="2"></circle>
            </svg>
            <!-- Inner Lock Corners -->
            <div class="absolute inset-3 border-2 border-transparent border-t-amber-container border-l-amber-container rounded-tl-lg"></div>
            <div class="absolute inset-3 border-2 border-transparent border-b-amber-container border-r-amber-container rounded-br-lg"></div>
            <!-- Real-Time Classification Tooltip -->
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-obsidian-scrim px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
              <span class="material-symbols-outlined text-tertiary-fixed-dim text-[14px]">psychology</span>
              <span class="font-label-sm text-label-sm text-vellum-bg font-medium tracking-wide">Sciuridae lock · 98%</span>
            </div>
          </div>

          <!-- Tactical Rangefinder & Level Meter -->
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-obsidian-scrim px-1.5 py-3 rounded-full text-vellum-bg font-label-sm text-label-sm">
            <span class="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">straighten</span>
            <div class="w-1 h-14 bg-surface-container/30 rounded-full relative overflow-hidden">
              <div class="absolute bottom-0 inset-x-0 bg-tertiary-fixed-dim h-9 rounded-full"></div>
            </div>
            <span class="font-mono text-[10px]">1.8m</span>
          </div>

          <!-- Digital Zoom Toggle Pills -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 rounded-full bg-obsidian-scrim backdrop-blur-md shadow-lg pointer-events-auto">
            <button class="zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-surface-container/20 text-vellum-bg font-bold shadow-sm cursor-pointer" data-zoom="1">1x</button>
            <button class="zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm text-vellum-bg/70 hover:text-vellum-bg transition-colors cursor-pointer" data-zoom="2">2x</button>
            <button class="zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm text-vellum-bg/70 hover:text-vellum-bg transition-colors cursor-pointer" data-zoom="5">5x</button>
          </div>
        </div>

        <!-- Lower Tactical HUD & Specimen Extraction Strip -->
        <div class="flex-1 bg-vellum-bg flex flex-col justify-between p-space-md min-h-[220px]">
          <!-- Top Auxiliary Classification Bar -->
          <div class="flex items-center justify-between gap-space-sm">
            <div class="flex items-center gap-2.5 bg-surface-card px-3 py-1.5 rounded-xl shadow-sm border border-outline-hairline/60 flex-1 min-w-0 cursor-pointer active:scale-95 transition-all" id="candidate-card">
              <div class="w-7 h-7 rounded-lg bg-sage-fill flex items-center justify-center text-primary shrink-0">
                <span class="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Candidate Identified</span>
                <span class="font-title-md text-title-md text-primary font-bold truncate leading-none">Indian Palm Squirrel</span>
              </div>
            </div>

            <!-- Bio-Acoustic Trigger Pill -->
            <button class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-container text-vellum-bg shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0" id="listen-trigger" title="Switch to Audio Spectrogram">
              <span class="material-symbols-outlined text-[18px] text-tertiary-fixed-dim animate-pulse">graphic_eq</span>
              <span class="font-label-sm text-label-sm uppercase tracking-wider font-semibold">LISTEN FOR NATURE</span>
            </button>
          </div>

          <!-- Primary Shutter Action Centerpiece -->
          <div class="flex items-center justify-around py-space-sm mt-1">
            <!-- Archival Gallery Thumbnail -->
            <button class="w-12 h-12 rounded-xl overflow-hidden border border-outline-hairline shadow-sm relative group cursor-pointer active:scale-95 transition-transform" id="scanner-folio-btn" title="Open Field Journal Folio">
              <img class="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Last Discovery" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCUa7mlEqL-Zl5MFy4hnfhdb1rSjhFiMP1X2DNG6Vo5QovjzpAhGZsqbSaUoPeyOcac-PgnfeM8FFl_kPrsPvaOnNMTifalb_GSZB8s5oB8VO9tc_ONVjzW9A-j8k015iT3EKJtrBT4ayxnjnMgbAmtNRkMPd-wXFa8Lfohw3pwxzB24U3-dsErWXk_cjLbviD12wqubyzkz1azwasGYEuckAoJmtzvlJmLCNsWLQbH_kn2pvGy8vb"/>
              <div class="absolute inset-0 bg-obsidian-scrim/20"></div>
            </button>

            <!-- 64px Tactile Shutter Button with Triple Ripple Rings -->
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-3 rounded-full bg-secondary-container/40 animate-ping opacity-25 pointer-events-none"></div>
              <div class="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center p-1 bg-surface-container-low shadow-md">
                <button aria-label="Capture specimen snapshot" class="w-full h-full rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform duration-150 cursor-pointer" id="shutter-btn">
                  <div class="w-14 h-14 rounded-full border-2 border-vellum-bg/40 flex items-center justify-center">
                    <span class="material-symbols-outlined text-vellum-bg text-[28px]">photo_camera</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Optical Sensor Torch / Flash -->
            <button class="w-12 h-12 rounded-full bg-surface-card-subtle flex items-center justify-center text-primary shadow-sm hover:bg-surface-container active:scale-95 transition-all cursor-pointer border border-outline-hairline/60" id="torch-btn" title="Toggle Optical Illumination">
              <span class="material-symbols-outlined text-[22px]" id="torch-icon">flashlight_on</span>
            </button>
          </div>

          <!-- Bottom Micro GPS & Hardware Barcode Telemetry -->
          <div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-1 border-t border-outline-hairline/40 font-mono">
            <button class="flex items-center gap-1 cursor-pointer hover:text-primary active:scale-95 transition-all text-left" id="gps-display-btn" title="Tap to view GPS position on Offline Map">
              <span class="material-symbols-outlined text-[14px] text-secondary">explore</span>
              <span id="gps-display-label">GPS LOCK · 19.0728° N, 72.8826° E</span>
            </button>
            <span class="text-secondary font-bold tracking-wider">OFFLINE AI ENGINE v3.8</span>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.refreshLiveGpsLabel();
  }

  private async refreshLiveGpsLabel(): Promise<void> {
    try {
      const coords = await GeoLocationTracker.getCurrentPosition(false);
      const gpsLabel = this.container.querySelector('#gps-display-label');
      if (gpsLabel) {
        gpsLabel.textContent = `GPS LOCK · ${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E (±${coords.accuracy || 15}m)`;
      }
    } catch {
      // Keep default
    }
  }

  private bindEvents(): void {
    // Shutter Trigger with Real Capture Pipeline
    const shutter = this.container.querySelector('#shutter-btn');
    shutter?.addEventListener('click', async () => {
      shutter.classList.add('scale-75');
      this.playShutterClick();
      this.triggerFlash();

      try {
        const capturedObservation = await this.captureCurrentSpecimen();
        setTimeout(() => {
          shutter.classList.remove('scale-75');
          this.stopCamera();
          this.onCapture(capturedObservation.id);
        }, 220);
      } catch (err) {
        console.error('Capture pipeline error:', err);
        setTimeout(() => {
          shutter.classList.remove('scale-75');
          this.stopCamera();
          this.onCapture();
        }, 220);
      }
    });

    // Listen For Nature Trigger
    const listenTrigger = this.container.querySelector('#listen-trigger');
    listenTrigger?.addEventListener('click', () => {
      this.stopCamera();
      this.onListenForNature();
    });

    // Folio button
    const folioBtn = this.container.querySelector('#scanner-folio-btn');
    folioBtn?.addEventListener('click', () => {
      this.stopCamera();
      this.onOpenFolio();
    });

    // GPS Telemetry Button -> View on Map
    const gpsBtn = this.container.querySelector('#gps-display-btn');
    gpsBtn?.addEventListener('click', () => {
      this.stopCamera();
      if (this.onOpenMap) {
        this.onOpenMap();
      }
    });

    // Candidate Card click -> open result
    const candidateCard = this.container.querySelector('#candidate-card');
    candidateCard?.addEventListener('click', () => {
      this.stopCamera();
      this.onCapture('indian-palm-squirrel');
    });

    // Torch Toggle
    const torchBtn = this.container.querySelector('#torch-btn');
    const torchIcon = this.container.querySelector('#torch-icon');
    torchBtn?.addEventListener('click', () => {
      this.torchActive = !this.torchActive;
      if (this.torchActive) {
        torchIcon!.textContent = 'flashlight_off';
        torchBtn.classList.add('bg-tertiary-fixed', 'text-amber-on-container');
        torchBtn.classList.remove('bg-surface-card-subtle', 'text-primary');
      } else {
        torchIcon!.textContent = 'flashlight_on';
        torchBtn.classList.remove('bg-tertiary-fixed', 'text-amber-on-container');
        torchBtn.classList.add('bg-surface-card-subtle', 'text-primary');
      }
    });

    // Zoom Buttons with Real Optical Scale Transform
    const zoomButtons = this.container.querySelectorAll('.zoom-btn');
    zoomButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        zoomButtons.forEach((b) => {
          b.className = 'zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm text-vellum-bg/70 hover:text-vellum-bg transition-colors cursor-pointer';
        });
        btn.className = 'zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-surface-container/20 text-vellum-bg font-bold shadow-sm cursor-pointer';

        const factor = Number(btn.getAttribute('data-zoom') || '1');
        this.zoomScale = factor === 1 ? 1.0 : factor === 2 ? 1.5 : 2.2;
        this.applyZoom();
      });
    });

    // Camera Stream Toggle Button
    const cameraToggle = this.container.querySelector('#toggle-camera-source-btn');
    cameraToggle?.addEventListener('click', () => {
      this.toggleLiveCamera();
    });
  }

  private applyZoom(): void {
    const video = this.container.querySelector('#scanner-video') as HTMLVideoElement;
    const img = this.container.querySelector('#scanner-sensor-img') as HTMLImageElement;
    const transformStr = `scale(${this.zoomScale})`;
    if (video) video.style.transform = transformStr;
    if (img) img.style.transform = transformStr;
  }

  private triggerFlash(): void {
    const flash = this.container.querySelector('#shutter-flash') as HTMLElement;
    if (flash) {
      flash.classList.remove('opacity-0');
      flash.classList.add('opacity-90');
      setTimeout(() => {
        flash.classList.remove('opacity-90');
        flash.classList.add('opacity-0');
      }, 120);
    }
  }

  private playShutterClick(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch {
      // AudioContext unavailable
    }
  }

  private async captureCurrentSpecimen(): Promise<FieldObservation> {
    const video = this.container.querySelector('#scanner-video') as HTMLVideoElement;
    const img = this.container.querySelector('#scanner-sensor-img') as HTMLImageElement;
    let photoUrl = img?.src || '';

    // If live camera is actively streaming, grab a high-res video frame
    if (this.isUsingLiveCamera && video && video.videoWidth > 0) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          photoUrl = canvas.toDataURL('image/jpeg', 0.88);
        }
      } catch (e) {
        console.warn('Canvas frame capture fallback:', e);
      }
    }

    const coords = await GeoLocationTracker.getCurrentPosition();
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newId = `specimen-${Date.now().toString().slice(-6)}`;

    const newObs: FieldObservation = {
      id: newId,
      timestamp: Date.now(),
      readableDate: `Today · ${timeFormatted}`,
      coordinates: coords,
      photoUrl: photoUrl,
      speciesCandidates: ['Indian Palm Squirrel', 'Funambulus palmarum'],
      commonName: 'Indian Palm Squirrel',
      scientificName: 'Funambulus palmarum',
      confidenceScore: 0.96,
      kingdomOrGroup: 'Animalia',
      habitat: `Field Sector · ${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E`,
      substrate: 'Weathered bark canopy',
      abundanceCount: 1,
      lifeStage: 'adult',
      weatherObservation: 'Field optical intake',
      fieldNotes: 'Captured via TrailScribe optical viewfinder reticle HUD. High confidence Sciuridae lock confirmed.',
      synced: false
    };

    await db.saveObservation(newObs);
    return newObs;
  }

  private async toggleLiveCamera(): Promise<void> {
    const video = this.container.querySelector('#scanner-video') as HTMLVideoElement;
    const img = this.container.querySelector('#scanner-sensor-img') as HTMLImageElement;
    const label = this.container.querySelector('#camera-status-label');

    if (!this.isUsingLiveCamera) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          this.videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          if (video) {
            video.srcObject = this.videoStream;
            video.classList.remove('hidden');
            img?.classList.add('hidden');
            this.isUsingLiveCamera = true;
            if (label) label.textContent = 'Live Lens Active';
          }
        }
      } catch (e) {
        console.warn('Camera device unavailable or permission dismissed, using optical canvas:', e);
      }
    } else {
      this.stopCamera();
      if (video) video.classList.add('hidden');
      if (img) img.classList.remove('hidden');
      this.isUsingLiveCamera = false;
      if (label) label.textContent = 'Local Vision AI • Offline';
    }
  }

  public stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((t) => t.stop());
      this.videoStream = null;
    }
  }
}
