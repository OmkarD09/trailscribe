export class AdventureMapView {
  private container: HTMLElement;
  private onSelectSpecimen: (specimenId: string) => void;
  private onViewFolio: () => void;

  constructor(
    container: HTMLElement,
    callbacks: {
      onSelectSpecimen: (specimenId: string) => void;
      onViewFolio: () => void;
    }
  ) {
    this.container = container;
    this.onSelectSpecimen = callbacks.onSelectSpecimen;
    this.onViewFolio = callbacks.onViewFolio;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex flex-col w-full relative view-enter">
        <!-- Interactive Topographic Canvas Container -->
        <div class="relative w-full h-[520px] overflow-hidden bg-surface-container select-none">
          <!-- Map Pipeline Element with Fallback Vector Cartography -->
          <div class="absolute inset-0 w-full h-full bg-cover bg-center" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuy3ofJa-ECsu0X6XbXvB_QdKsFGo1V9UeB70pBrcxEz6OV0mjqFQwDFMH7PhNpEdZYqT77beZoW0Y_XeKxNG0YqUx7UFA896S04fbvB9GPjaZp6bcimZN3wcdiEbl0jjI59SjM4FovBT3LHPCyAvQtZZIZ5OwY5SWc0d9yN-xCTFJLSMiiFDMUU96tEqMc34x_67iBs5AFUISa-NMmlW35XdmIYRXx7-0LSg4i17nWFdOXP9UYMfg')"></div>

          <!-- Serene Topographic Contour Overlay & Vellum Wash -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-45 mix-blend-multiply" preserveaspectratio="none" viewbox="0 0 390 520" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialgradient cx="50%" cy="45%" id="contour-fog" r="65%">
                <stop offset="0%" stop-color="#F8F6F0" stop-opacity="0.3"></stop>
                <stop offset="100%" stop-color="#EAE6DC" stop-opacity="0.85"></stop>
              </radialgradient>
            </defs>
            <rect fill="url(#contour-fog)" height="100%" width="100%"></rect>
            <!-- Archival Fine Contour Lines -->
            <path d="M-40,80 C40,40 120,110 200,70 C280,30 360,90 440,60" fill="none" opacity="0.6" stroke="#727974" stroke-dasharray="3,3" stroke-width="0.8"></path>
            <path d="M-30,130 C60,90 140,160 230,120 C320,80 390,140 450,110" fill="none" opacity="0.5" stroke="#727974" stroke-width="0.8"></path>
            <path d="M-20,190 C70,160 160,220 250,180 C330,140 410,210 450,170" fill="none" opacity="0.55" stroke="#416652" stroke-width="1"></path>
            <path d="M-40,250 C50,220 130,290 220,240 C310,190 380,270 440,230" fill="none" opacity="0.5" stroke="#727974" stroke-dasharray="4,2" stroke-width="0.8"></path>
            <path d="M-30,320 C80,280 170,350 260,300 C340,260 400,330 460,290" fill="none" opacity="0.5" stroke="#727974" stroke-width="0.8"></path>
            <path d="M-50,390 C60,360 140,420 240,370 C330,330 390,400 450,360" fill="none" opacity="0.6" stroke="#727974" stroke-dasharray="2,4" stroke-width="0.8"></path>
            <path d="M-20,460 C70,430 180,490 270,440 C350,400 410,470 450,430" fill="none" opacity="0.5" stroke="#416652" stroke-width="1.2"></path>
            <!-- Topographic Elevation Markers -->
            <text fill="#416652" font-family="Plus Jakarta Sans" font-size="9" letter-spacing="0.08em" opacity="0.7" x="28" y="196">780m</text>
            <text fill="#416652" font-family="Plus Jakarta Sans" font-size="9" letter-spacing="0.08em" opacity="0.7" x="320" y="306">840m</text>
            <text fill="#416652" font-family="Plus Jakarta Sans" font-size="9" letter-spacing="0.08em" opacity="0.7" x="145" y="446">910m</text>
          </svg>

          <!-- Trail Ribbon Vector Path with Live Active Sector -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" viewbox="0 0 390 520" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter height="140%" id="amber-radiance" width="140%" x="-20%" y="-20%">
                <feDropShadow dx="0" dy="0" flood-color="#cd8e2e" flood-opacity="0.85" stdDeviation="3.5"></feDropShadow>
              </filter>
            </defs>
            <!-- Completed Path: Deep Forest Green Ink -->
            <path d="M 68,435 Q 92,390 124,348 T 195,282 T 268,225" fill="none" stroke="#042217" stroke-dasharray="7,3" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5"></path>
            <!-- Active Sector Ribbon: Amber Vector Glow -->
            <path d="M 268,225 Q 294,202 308,168" fill="none" filter="url(#amber-radiance)" stroke="#cd8e2e" stroke-linecap="round" stroke-width="4.5"></path>
            <!-- Compass Vector Scale Grid Tick -->
            <circle cx="68" cy="435" fill="#042217" r="4.5"></circle>
            <circle cx="68" cy="435" fill="none" opacity="0.5" r="8" stroke="#042217" stroke-width="1.2"></circle>
          </svg>

          <!-- Discovery Waypoint Pins Layer -->
          <!-- Pin 1: Bird Discovery (Asian Koel) -->
          <div class="map-pin absolute left-[116px] top-[338px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer" data-id="asian-koel">
            <div class="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center shadow-md active:scale-90 transition-transform">
              <span class="material-symbols-outlined text-[18px] text-secondary">raven</span>
            </div>
            <div class="absolute left-1/2 -translate-x-1/2 top-9 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              <span class="font-label-sm text-label-sm">Eudynamys scolopaceus</span>
            </div>
          </div>

          <!-- Pin 2: Flora Discovery (Wild Orchid) -->
          <div class="map-pin absolute left-[190px] top-[272px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer" data-id="wild-orchid">
            <div class="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center shadow-md active:scale-90 transition-transform">
              <span class="material-symbols-outlined text-[18px] text-secondary">potted_plant</span>
            </div>
            <div class="absolute left-1/2 -translate-x-1/2 top-9 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              <span class="font-label-sm text-label-sm">Aerides maculosa</span>
            </div>
          </div>

          <!-- Pin 3: Insect Discovery (Common Mormon) -->
          <div class="map-pin absolute left-[262px] top-[215px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer" data-id="common-mormon">
            <div class="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center shadow-md active:scale-90 transition-transform">
              <span class="material-symbols-outlined text-[18px] text-secondary">flutter</span>
            </div>
            <div class="absolute left-1/2 -translate-x-1/2 top-9 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              <span class="font-label-sm text-label-sm">Papilio polytes</span>
            </div>
          </div>

          <!-- Pin 4: Scenic Viewpoint -->
          <div class="map-pin absolute left-[162px] top-[178px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer" data-id="canyon-vista">
            <div class="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center shadow-sm active:scale-90 transition-transform">
              <span class="material-symbols-outlined text-[16px] text-primary">landscape</span>
            </div>
            <div class="absolute left-1/2 -translate-x-1/2 top-8 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              <span class="font-label-sm text-label-sm">Canyon Crest Vista</span>
            </div>
          </div>

          <!-- Active Naturalist Waypoint: Pulsing Field Position -->
          <div class="absolute left-[308px] top-[168px] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div class="relative flex items-center justify-center">
              <span class="absolute w-9 h-9 rounded-full bg-on-tertiary-container/30 animate-ping"></span>
              <span class="absolute w-6 h-6 rounded-full bg-on-tertiary-container/40"></span>
              <div class="w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-md">
                <div class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></div>
              </div>
            </div>
          </div>

          <!-- Floating Top Trip Strip Card: Live Expedition Telemetry -->
          <div class="absolute top-4 inset-x-margin z-20">
            <div class="w-full bg-surface-card rounded-xl p-space-md shadow-md flex flex-col gap-space-xs border border-outline-hairline/60">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-on-tertiary-container" style="font-variation-settings: 'FILL' 1;">near_me</span>
                  <span class="font-label-sm text-label-sm tracking-wider uppercase text-on-surface-variant font-bold">Your Adventure</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">Active Track</span>
              </div>
              <div class="grid grid-cols-3 divide-x-0 pt-1">
                <div class="flex flex-col">
                  <span class="font-headline-md text-headline-md text-primary leading-tight font-serif">2.7<span class="font-label-md text-label-md ml-1 text-on-surface-variant font-normal">KM</span></span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Distance</span>
                </div>
                <div class="flex flex-col pl-3">
                  <span class="font-headline-md text-headline-md text-primary leading-tight font-serif">38<span class="font-label-md text-label-md ml-1 text-on-surface-variant font-normal">MIN</span></span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Elapsed</span>
                </div>
                <div class="flex flex-col pl-3">
                  <span class="font-headline-md text-headline-md text-primary leading-tight font-serif">5<span class="font-label-md text-label-md ml-1 text-on-surface-variant font-normal">LOGS</span></span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Discoveries</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating Map Field Controls (Right Side Utility Column) -->
          <div class="absolute right-margin bottom-10 z-20 flex flex-col gap-space-sm">
            <button aria-label="Compass Orientation" class="w-12 h-12 rounded-full bg-surface-card text-primary shadow-md flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-hairline/60" id="map-compass-btn">
              <span class="material-symbols-outlined text-[22px] text-secondary">explore</span>
            </button>
            <button aria-label="Topographic Layers" class="w-12 h-12 rounded-full bg-surface-card text-primary shadow-md flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-hairline/60" id="map-layers-btn">
              <span class="material-symbols-outlined text-[22px] text-secondary">layers</span>
            </button>
            <button aria-label="Locate Me" class="w-12 h-12 rounded-full bg-primary-container text-vellum-bg shadow-md flex items-center justify-center active:scale-95 transition-transform cursor-pointer" id="map-locate-btn">
              <span class="material-symbols-outlined text-[22px] text-tertiary-fixed-dim" style="font-variation-settings: 'FILL' 1;">my_location</span>
            </button>
          </div>

          <!-- Topographic Attribution & Altitude Ribbon -->
          <div class="absolute left-margin bottom-10 z-10 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur-sm shadow-sm flex items-center gap-1.5 pointer-events-none">
            <span class="w-2 h-2 rounded-full bg-secondary"></span>
            <span class="font-label-sm text-label-sm text-on-surface font-mono">Ridge Sector IV · 842m Elev.</span>
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
            <!-- Card 1: Asian Koel -->
            <div class="map-carousel-card min-w-[260px] max-w-[260px] bg-surface-card rounded-xl p-space-sm shadow-sm flex flex-col gap-space-sm snap-start shrink-0 cursor-pointer border border-outline-hairline/60" data-id="asian-koel">
              <div class="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container-high">
                <img class="w-full h-full object-cover" alt="Asian Koel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4v7MAnlTBPhXOjjznhrNUaySsS_57290id3-GzEnq4vAejxjOFxhjQ_fKAuxVRwa9lcDV2rWOnu77U0DQUGitVLZ3M_Vetafjme5DjfEq1bZJd2DCf847oaJ1He-eNpUPSRWKUNbAxr4zXKaFp6PiNdY_Qk3uJjz-m-8mJWHgjYXZjiCFH7UzJDSDXgodMNmdGM-AxIeWOAgCz8I_3YlhErlffPtMQYYp3-XdzAa684D-XRM4GzSJ"/>
                <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                  <span class="font-label-sm text-label-sm tracking-wider">96% MATCH</span>
                </div>
                <div class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg">
                  <span class="font-label-sm text-label-sm tracking-wide">14:12</span>
                </div>
              </div>
              <div class="flex flex-col min-w-0 px-1">
                <span class="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-wider font-bold">Fauna · Aves</span>
                <h3 class="font-title-md text-title-md text-primary truncate leading-snug font-serif">Asian Koel</h3>
                <p class="font-latin-name text-latin-name italic text-secondary truncate">Eudynamys scolopaceus</p>
              </div>
              <div class="flex items-center gap-1.5 px-1 pt-1">
                <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">Native</span>
                <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">Diurnal</span>
                <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">LC</span>
              </div>
            </div>

            <!-- Card 2: Wild Orchid -->
            <div class="map-carousel-card min-w-[260px] max-w-[260px] bg-surface-card rounded-xl p-space-sm shadow-sm flex flex-col gap-space-sm snap-start shrink-0 cursor-pointer border border-outline-hairline/60" data-id="wild-orchid">
              <div class="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container-high">
                <img class="w-full h-full object-cover" alt="Fox Brush Orchid" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgaRJWT74EqIRstXN_SurEhVvSS8oeVcVqEF2ApvNKoRKvvMlLO2L4mifpVaNzWuSq3nl3OBbBRETwl8Zn23IrB01k403I3ISnZ0j6uSGshQNaX4YIrkb6-GmAxink5dtdgsJ3d-hwo3c_IeITVLY5RIb6GBFSXJJWkcwhYYSUS0Ytgt3ZRd_GU0xKMCrBO7vLCKeRMPYezXwWL9UR0aI_FY05Om9eLE3rh1NVPEMWYlPekQK_zonB"/>
                <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                  <span class="font-label-sm text-label-sm tracking-wider">92% MATCH</span>
                </div>
                <div class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg">
                  <span class="font-label-sm text-label-sm tracking-wide">13:48</span>
                </div>
              </div>
              <div class="flex flex-col min-w-0 px-1">
                <span class="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-wider font-bold">Flora · Orchidaceae</span>
                <h3 class="font-title-md text-title-md text-primary truncate leading-snug font-serif">Fox Brush Orchid</h3>
                <p class="font-latin-name text-latin-name italic text-secondary truncate">Aerides maculosa</p>
              </div>
              <div class="flex items-center gap-1.5 px-1 pt-1">
                <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">Epiphyte</span>
                <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">Endemic</span>
                <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">VU</span>
              </div>
            </div>

            <!-- Card 3: Common Mormon Butterfly -->
            <div class="map-carousel-card min-w-[260px] max-w-[260px] bg-surface-card rounded-xl p-space-sm shadow-sm flex flex-col gap-space-sm snap-start shrink-0 cursor-pointer border border-outline-hairline/60" data-id="common-mormon">
              <div class="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container-high">
                <img class="w-full h-full object-cover" alt="Common Mormon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx5RdTPJT0vfZoBoiRNgX_MWcJeCbGLDAzBGktEISLF_JEPaJYewkCF3aoKnk1pmowuJ70YLLBHKReHWTB2SMg-1GDwn2IwoZ1SRZ_AjCRVW8lGFitd9dF61N-w2W6Rku7hDoGSPPfuEfTUGIN6MM0ypgxZyu_XszVU-YGDAEmCrK51tWw7NEqjGrerYwwQrfPJIWOdXDrHbshTPXYGY85j49p2AVKGD44egWTLez0qckhOrTwR5yR"/>
                <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                  <span class="font-label-sm text-label-sm tracking-wider">98% MATCH</span>
                </div>
                <div class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-obsidian-scrim text-vellum-bg">
                  <span class="font-label-sm text-label-sm tracking-wide">13:15</span>
                </div>
              </div>
              <div class="flex flex-col min-w-0 px-1">
                <span class="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-wider font-bold">Insecta · Papilionidae</span>
                <h3 class="font-title-md text-title-md text-primary truncate leading-snug font-serif">Common Mormon</h3>
                <p class="font-latin-name text-latin-name italic text-secondary truncate">Papilio polytes</p>
              </div>
              <div class="flex items-center gap-1.5 px-1 pt-1">
                <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">Native</span>
                <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">Pollinator</span>
                <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary font-label-md text-label-md">LC</span>
              </div>
            </div>
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
                High humidity (88%) along northern slope. Rapid avian canopy vocalizations between 750m and 810m elevation bands.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Map Pins
    const pins = this.container.querySelectorAll('.map-pin');
    pins.forEach((pin) => {
      pin.addEventListener('click', () => {
        const id = pin.getAttribute('data-id') || 'asian-koel';
        this.onSelectSpecimen(id);
      });
    });

    // Carousel Cards
    const cards = this.container.querySelectorAll('.map-carousel-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id') || 'asian-koel';
        this.onSelectSpecimen(id);
      });
    });

    // View Folio
    const viewFolioBtn = this.container.querySelector('#map-view-folio-btn');
    viewFolioBtn?.addEventListener('click', () => {
      this.onViewFolio();
    });
  }
}
