export class NatureScannerView {
  private container: HTMLElement;
  private onCapture: () => void;
  private onListenForNature: () => void;
  private onOpenFolio: () => void;
  private videoStream: MediaStream | null = null;
  private torchActive: boolean = false;
  private isUsingLiveCamera: boolean = false;

  constructor(
    container: HTMLElement,
    callbacks: {
      onCapture: () => void;
      onListenForNature: () => void;
      onOpenFolio: () => void;
    }
  ) {
    this.container = container;
    this.onCapture = callbacks.onCapture;
    this.onListenForNature = callbacks.onListenForNature;
    this.onOpenFolio = callbacks.onOpenFolio;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex flex-col w-full relative select-none view-enter">
        <!-- Viewfinder Optical Canvas -->
        <div class="relative w-full overflow-hidden aspect-[3/4] max-h-[636px] flex items-center justify-center bg-primary">
          <!-- Camera Sensor Live Stream Placeholder / Real Video Element -->
          <video id="scanner-video" class="absolute inset-0 w-full h-full object-cover hidden" playsinline autoplay muted></video>
          <img id="scanner-sensor-img" class="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Indian Palm Squirrel Viewfinder" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlTf7kYXp4Z-sCYzhAcO6kMDxEmX7ZCoLcjfRKB86mU39qnHQdSyhVa4TQIMB4vDbiA9xRLtdZtXyLEFPaM_xmMWvEGZdxzJJDx4SqLqPeFmdIjADE56zG0jGd_mcOrTtgoHtj-sZ-xxJv3LAUkNqrpnmFMb3YOYhY5eWqXD1xHDJjGW_55OkF0yhlzYS5CKoAHXliQ_V4VRJsg5WmFw_OHc_7aQnUf1KNgePhpevO7MU3Qv95oU3N"/>
          
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
              <svg fill="none" height="32" viewbox="0 0 32 32" width="32">
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
          <div class="absolute top-[32%] left-[28%] w-44 h-44 pointer-events-none transition-all duration-300 transform -translate-x-2 -translate-y-2">
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
            <span class="text-[10px] font-mono opacity-90">1.2m</span>
          </div>

          <!-- On-screen Zoom Control Bar -->
          <div class="absolute bottom-4 inset-x-0 flex justify-center pointer-events-auto">
            <div class="inline-flex items-center gap-1 bg-obsidian-scrim p-1 rounded-full shadow-md" id="zoom-controls">
              <button class="zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm text-vellum-bg/70 hover:text-vellum-bg transition-colors cursor-pointer" data-zoom="0.5x">0.5x</button>
              <button class="zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-surface-container/20 text-vellum-bg font-bold shadow-sm cursor-pointer" data-zoom="1x">1x</button>
              <button class="zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm text-vellum-bg/70 hover:text-vellum-bg transition-colors cursor-pointer" data-zoom="2x">2x</button>
              <button class="zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm text-vellum-bg/70 hover:text-vellum-bg transition-colors cursor-pointer" data-zoom="5x">5x</button>
            </div>
          </div>
        </div>

        <!-- Bottom Hardware Operation Deck -->
        <div class="w-full px-margin pt-space-md pb-space-lg flex flex-col items-center gap-space-md bg-vellum-bg">
          <!-- Bio-Acoustic Capture Pill -->
          <button class="group relative inline-flex items-center gap-space-sm px-5 py-2.5 rounded-full bg-surface-card shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer border border-outline-hairline/60" id="listen-trigger">
            <span class="material-symbols-outlined text-primary text-[20px] group-hover:text-secondary transition-colors" style="font-variation-settings: 'FILL' 1;">graphic_eq</span>
            <span class="font-title-md text-body-sm font-semibold tracking-wide text-primary">LISTEN FOR NATURE</span>
            <div class="flex items-center gap-0.5 ml-1" id="soundwave">
              <span class="w-1 h-3 bg-tertiary-fixed-dim rounded-full anim-wave-1"></span>
              <span class="w-1 h-5 bg-tertiary-fixed-dim rounded-full anim-wave-2"></span>
              <span class="w-1 h-2 bg-tertiary-fixed-dim rounded-full anim-wave-3"></span>
            </div>
          </button>

          <!-- Main Instrument Control Cluster -->
          <div class="w-full flex items-center justify-around max-w-sm px-space-sm">
            <!-- Specimen Roll / Gallery Action -->
            <div class="flex flex-col items-center gap-1">
              <button aria-label="Field Specimen Folio" class="w-12 h-12 rounded-full bg-surface-card-subtle flex items-center justify-center text-primary shadow-sm active:scale-90 transition-all hover:bg-surface-container cursor-pointer" id="scanner-folio-btn">
                <span class="material-symbols-outlined text-[24px]">photo_library</span>
              </button>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Folio</span>
            </div>

            <!-- Primary Hardware Shutter Button (64px, Forest Green with Inset Cream Ring) -->
            <div class="relative flex items-center justify-center">
              <!-- Tactile Ring Accent -->
              <div class="absolute -inset-2 rounded-full bg-secondary-container/50 pointer-events-none shutter-ripple"></div>
              <button aria-label="Capture & Classify Specimen" class="relative w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform focus:outline-none cursor-pointer" id="shutter-btn">
                <!-- Inset 3px Cream Physical Stroke -->
                <div class="w-[52px] h-[52px] rounded-full bg-transparent flex items-center justify-center">
                  <svg class="w-full h-full" viewbox="0 0 52 52">
                    <circle cx="26" cy="26" fill="none" r="23" stroke="#F8F6F0" stroke-width="3"></circle>
                  </svg>
                  <div class="absolute w-7 h-7 rounded-full bg-vellum-bg"></div>
                </div>
              </button>
            </div>

            <!-- Flash / Field Torch Toggle -->
            <div class="flex flex-col items-center gap-1">
              <button aria-label="Toggle Field Torch" class="w-12 h-12 rounded-full bg-surface-card-subtle flex items-center justify-center text-primary shadow-sm active:scale-90 transition-all hover:bg-surface-container cursor-pointer" id="torch-btn">
                <span class="material-symbols-outlined text-[24px]" id="torch-icon">flashlight_on</span>
              </button>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Torch</span>
            </div>
          </div>

          <!-- Quick Specimen Context Indicator Card -->
          <div class="w-full bg-surface-card rounded-xl p-space-md shadow-sm flex items-center justify-between border border-outline-hairline/60 cursor-pointer active:bg-surface-card-subtle transition-colors" id="candidate-card">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                <span class="material-symbols-outlined text-[22px]">nest_eco_leaf</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-label-sm text-label-sm text-on-tertiary-fixed-variant uppercase tracking-wider">Candidate Sighting</span>
                <span class="font-title-md text-title-md text-primary truncate leading-tight">Indian Palm Squirrel</span>
                <span class="font-latin-name text-latin-name italic text-secondary leading-none">Funambulus palmarum</span>
              </div>
            </div>
            <div class="flex flex-col items-end shrink-0 pl-2">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                Native
              </span>
              <span class="font-label-sm text-label-sm text-outline-border mt-1">Order Rodentia</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Shutter Trigger
    const shutter = this.container.querySelector('#shutter-btn');
    shutter?.addEventListener('click', () => {
      shutter.classList.add('scale-75');
      setTimeout(() => {
        shutter.classList.remove('scale-75');
        this.stopCamera();
        this.onCapture();
      }, 180);
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

    // Candidate Card click -> open result
    const candidateCard = this.container.querySelector('#candidate-card');
    candidateCard?.addEventListener('click', () => {
      this.stopCamera();
      this.onCapture();
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

    // Zoom Buttons
    const zoomButtons = this.container.querySelectorAll('.zoom-btn');
    zoomButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        zoomButtons.forEach((b) => {
          b.className = 'zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm text-vellum-bg/70 hover:text-vellum-bg transition-colors cursor-pointer';
        });
        btn.className = 'zoom-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-surface-container/20 text-vellum-bg font-bold shadow-sm cursor-pointer';
      });
    });

    // Camera Stream Toggle Button
    const cameraToggle = this.container.querySelector('#toggle-camera-source-btn');
    cameraToggle?.addEventListener('click', () => {
      this.toggleLiveCamera();
    });
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
        console.warn('Camera device unavailable or permission denied, using specimen canvas:', e);
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
