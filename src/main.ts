import './app/styles/main.css';

import { db } from './storage/db';
import { SplashWelcomeView } from './app/components/SplashWelcomeView';
import { HomeDashboardView } from './app/components/HomeDashboardView';
import { NatureScannerView } from './app/components/NatureScannerView';
import { SoundIdentificationView } from './app/components/SoundIdentificationView';
import { IdentificationResultView } from './app/components/IdentificationResultView';
import { FieldJournalView } from './app/components/FieldJournalView';
import { AdventureMapView } from './app/components/AdventureMapView';
import { AdventureModeView } from './app/components/AdventureModeView';
import { AdventureCompleteView } from './app/components/AdventureCompleteView';
import { ProfileOutdoorYearView } from './app/components/ProfileOutdoorYearView';

export type ScreenId =
  | 'splash-welcome'
  | 'field-hub'
  | 'offline-map'
  | 'specimen-capture'
  | 'sound-identification'
  | 'identification-result'
  | 'field-journal'
  | 'adventure-mode'
  | 'adventure-complete'
  | 'naturalist-profile';

interface ScreenMeta {
  id: ScreenId;
  name: string;
  hasHeader: boolean;
  hasNav: boolean;
  headerTitle: string;
  isSecondary: boolean;
}

const SCREENS: Record<ScreenId, ScreenMeta> = {
  'splash-welcome': {
    id: 'splash-welcome',
    name: '1. Splash Welcome',
    hasHeader: false,
    hasNav: false,
    headerTitle: '',
    isSecondary: false
  },
  'field-hub': {
    id: 'field-hub',
    name: '2. Home Field Hub',
    hasHeader: true,
    hasNav: true,
    headerTitle: 'Field Hub',
    isSecondary: false
  },
  'offline-map': {
    id: 'offline-map',
    name: '3. Offline Adventure Map',
    hasHeader: true,
    hasNav: true,
    headerTitle: 'Offline Map',
    isSecondary: false
  },
  'specimen-capture': {
    id: 'specimen-capture',
    name: '4. Nature Scanner HUD',
    hasHeader: true,
    hasNav: false,
    headerTitle: 'Specimen Capture',
    isSecondary: true
  },
  'sound-identification': {
    id: 'sound-identification',
    name: '5. Sound Spectrogram ID',
    hasHeader: true,
    hasNav: false,
    headerTitle: 'Identification Result',
    isSecondary: true
  },
  'identification-result': {
    id: 'identification-result',
    name: '6. AI Specimen Plate',
    hasHeader: true,
    hasNav: false,
    headerTitle: 'Identification Result',
    isSecondary: true
  },
  'field-journal': {
    id: 'field-journal',
    name: '7. Field Journal Folio',
    hasHeader: true,
    hasNav: true,
    headerTitle: 'Field Journal',
    isSecondary: false
  },
  'adventure-mode': {
    id: 'adventure-mode',
    name: '8. Active Field Quest',
    hasHeader: true,
    hasNav: false,
    headerTitle: 'Specimen Capture',
    isSecondary: true
  },
  'adventure-complete': {
    id: 'adventure-complete',
    name: '9. Adventure Complete',
    hasHeader: true,
    hasNav: false,
    headerTitle: 'Specimen Entry',
    isSecondary: true
  },
  'naturalist-profile': {
    id: 'naturalist-profile',
    name: '10. Naturalist Profile',
    hasHeader: true,
    hasNav: true,
    headerTitle: 'Naturalist Profile',
    isSecondary: false
  }
};

class TrailScribeApp {
  private currentScreen: ScreenId = 'field-hub';
  private previousScreen: ScreenId = 'field-hub';
  private selectedSpecimenId: string = 'asian-koel';
  private activeScannerInstance: NatureScannerView | null = null;
  private isSwitcherOpen: boolean = false;

  async init(): Promise<void> {
    await db.seedDefaultDataIfEmpty();

    const appEl = document.getElementById('app');
    if (!appEl) return;

    // Render App Framework
    appEl.innerHTML = `
      <!-- Fixed Stitch Top Bar Header -->
      <header id="stitch-header" class="fixed top-0 inset-x-0 z-50 bg-vellum-bg/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(21,26,23,0.04)] max-w-[480px] mx-auto">
        <div class="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div class="flex items-center gap-space-sm min-w-0 flex-1" id="header-leading-group">
            <button aria-label="Go back" class="w-11 h-11 -ml-1 rounded-full flex items-center justify-center text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer hidden" id="header-back-btn">
              <span class="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <img alt="TrailScribe Logo" class="h-8 w-auto object-contain shrink-0" id="header-brand-logo" src="https://lh3.googleusercontent.com/aida/AEtjO1UJ4ad2LiDWHiIqCsFCgBI-5mZwdOsdoGnzGk6iZZZBTHS8UbsNGwzBsHkal0MDptQEHd4Wee8VpaCJbcaF_mMj2a5jpECvt-LCdqR77l5a86ncPV1BN4f-FMHRsFl4KYPvGxvYuwGQ6bnY1zgC8RmW_sZYWEqOA5bpFUFhqnI_5jN1JBYLnEdISXTsA1TmCLePr1j4DGcU_8IpHs2AIlQKoygreZR0-odP5qkZ0JvKaHMMZkvvzATGHA"/>
            <div class="flex flex-col min-w-0" id="header-title-container">
              <span class="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-bold truncate">TrailScribe</span>
              <h1 class="font-headline-md text-headline-md text-primary truncate leading-none font-serif" id="header-title-text">Field Hub</h1>
            </div>
          </div>
          <div class="flex items-center gap-space-sm shrink-0">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian-scrim text-vellum-bg cursor-pointer hover:opacity-90 active:scale-95 transition-all" id="header-status-pill" title="Stitch Screen Matrix">
              <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
              <span class="font-label-sm text-label-sm tracking-wider uppercase font-bold text-vellum-bg">Local AI • Offline</span>
            </div>
            <button class="w-11 h-11 rounded-full p-0.5 flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-95 transition-transform" id="header-profile-btn" aria-label="Naturalist Profile">
              <img alt="Profile" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmrP4X-EhK77vuSbVHvx4HHZFwzrPVQFyfECy4Heo5B8jqaJtGZvT9-AzEI9T9CFRjoCe4TmBXZAHu9rHJmrFzJAx34apRTWVsZJFFa1LuAgQCFesHb_GouVnlEf1dOqfp_dLnwlMfDgsp_XVRYyM51rGsw64pZiXitM7WAf-9iBTLy3-OvL2lSOKIFTcf-8zS3fbsgRvxeXrM0NSUpYCFxqBpLbJ8JC2TaEmJKTwKzX5yztS8w6Ay"/>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Dynamic Content Container -->
      <main id="app-viewport" class="flex flex-col relative w-full pt-16 min-h-screen bg-vellum-bg"></main>

      <!-- Fixed Stitch Bottom Navigation Bar -->
      <nav id="stitch-nav" class="fixed bottom-0 inset-x-0 z-50 pb-safe bg-vellum-bg/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(21,26,23,0.06)] max-w-[480px] mx-auto border-t border-outline-hairline/60">
        <div class="relative flex items-center justify-between h-16 px-space-xs max-w-[390px] mx-auto">
          <!-- Tab 1: Home -->
          <button class="nav-tab-btn flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors text-primary font-bold cursor-pointer" data-target="field-hub">
            <span class="material-symbols-outlined text-[24px]">nest_eco_leaf</span>
            <span class="font-label-sm text-label-sm tracking-wide mt-0.5">Home</span>
          </button>
          <!-- Tab 2: Explore -->
          <button class="nav-tab-btn flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" data-target="offline-map">
            <span class="material-symbols-outlined text-[24px]">explore</span>
            <span class="font-label-sm text-label-sm tracking-wide mt-0.5">Explore</span>
          </button>
          <!-- Center Hub: Identify / Camera Shutter -->
          <div class="relative -top-5 flex flex-col items-center justify-center px-1 z-20 shrink-0">
            <button class="w-16 h-16 rounded-full bg-primary-container text-vellum-bg shadow-[0_4px_16px_rgba(21,26,23,0.18)] flex items-center justify-center p-1 hover:bg-secondary transition-transform active:scale-95 cursor-pointer" id="nav-btn-identify">
              <div class="w-full h-full rounded-full border-2 border-vellum-bg/80 flex items-center justify-center">
                <span class="material-symbols-outlined text-[28px] text-vellum-bg">photo_camera</span>
              </div>
            </button>
            <span class="font-label-sm text-label-sm tracking-wide text-primary font-bold mt-1">Identify</span>
          </div>
          <!-- Tab 4: Journal -->
          <button class="nav-tab-btn flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" data-target="field-journal">
            <span class="material-symbols-outlined text-[24px]">menu_book</span>
            <span class="font-label-sm text-label-sm tracking-wide mt-0.5">Journal</span>
          </button>
          <!-- Tab 5: Profile -->
          <button class="nav-tab-btn flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" data-target="naturalist-profile">
            <span class="material-symbols-outlined text-[24px]">person</span>
            <span class="font-label-sm text-label-sm tracking-wide mt-0.5">Profile</span>
          </button>
        </div>
      </nav>

      <!-- Floating Stitch Screen Navigator Drawer -->
      <div id="stitch-screen-matrix" class="fixed bottom-20 right-4 z-[99] hidden flex-col gap-1 p-2 bg-obsidian-scrim backdrop-blur-xl text-vellum-bg rounded-2xl shadow-2xl border border-primary-fixed/20 max-w-[280px]">
        <div class="flex items-center justify-between pb-1.5 px-2 border-b border-vellum-bg/10">
          <span class="font-label-sm text-[10px] uppercase font-bold tracking-widest text-tertiary-fixed-dim">Stitch Design System (10/10)</span>
          <button id="close-matrix-btn" class="w-5 h-5 flex items-center justify-center text-vellum-bg/70 hover:text-vellum-bg cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
        <div class="flex flex-col gap-1 max-h-[360px] overflow-y-auto py-1">
          ${Object.values(SCREENS)
            .map(
              (s) => `
            <button class="matrix-jump-btn text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:bg-vellum-bg/10 flex items-center justify-between cursor-pointer" data-screen="${s.id}">
              <span>${s.name}</span>
              <span class="material-symbols-outlined text-[14px] opacity-60">arrow_right</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Quick Screen Navigator Floating Pill -->
      <button id="matrix-toggle-pill" class="fixed top-20 right-3 z-40 px-2.5 py-1 rounded-full bg-obsidian-scrim/80 hover:bg-obsidian-scrim backdrop-blur-md text-tertiary-fixed-dim text-[11px] font-mono tracking-wider shadow-lg flex items-center gap-1.5 border border-tertiary-fixed-dim/30 cursor-pointer active:scale-95 transition-all" title="Open Stitch Screen Matrix">
        <span class="material-symbols-outlined text-[14px]">grid_view</span>
        <span>10 Screens</span>
      </button>
    `;

    this.bindGlobalEvents();
    this.navigateTo('field-hub');
  }

  private bindGlobalEvents(): void {
    // Header Back button
    const backBtn = document.getElementById('header-back-btn');
    backBtn?.addEventListener('click', () => {
      this.navigateBack();
    });

    // Profile Avatar in header
    const profileBtn = document.getElementById('header-profile-btn');
    profileBtn?.addEventListener('click', () => {
      this.navigateTo('naturalist-profile');
    });

    // Offline Pill in header (toggles matrix)
    const statusPill = document.getElementById('header-status-pill');
    statusPill?.addEventListener('click', () => {
      this.toggleScreenMatrix();
    });

    // Bottom Navigation Tabs
    const navTabs = document.querySelectorAll('.nav-tab-btn');
    navTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target') as ScreenId;
        if (target) {
          this.navigateTo(target);
        }
      });
    });

    // Center Shutter Button (Identify)
    const identifyBtn = document.getElementById('nav-btn-identify');
    identifyBtn?.addEventListener('click', () => {
      this.navigateTo('specimen-capture');
    });

    // Matrix Drawer Toggle Button
    const matrixToggle = document.getElementById('matrix-toggle-pill');
    matrixToggle?.addEventListener('click', () => {
      this.toggleScreenMatrix();
    });

    const closeMatrixBtn = document.getElementById('close-matrix-btn');
    closeMatrixBtn?.addEventListener('click', () => {
      this.toggleScreenMatrix(false);
    });

    // Matrix Jump Buttons
    const jumpBtns = document.querySelectorAll('.matrix-jump-btn');
    jumpBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const screen = btn.getAttribute('data-screen') as ScreenId;
        if (screen) {
          this.toggleScreenMatrix(false);
          this.navigateTo(screen);
        }
      });
    });
  }

  private toggleScreenMatrix(force?: boolean): void {
    const drawer = document.getElementById('stitch-screen-matrix');
    if (!drawer) return;
    this.isSwitcherOpen = force !== undefined ? force : !this.isSwitcherOpen;
    if (this.isSwitcherOpen) {
      drawer.classList.remove('hidden');
      drawer.classList.add('flex');
    } else {
      drawer.classList.add('hidden');
      drawer.classList.remove('flex');
    }
  }

  public navigateTo(screenId: ScreenId): void {
    this.previousScreen = this.currentScreen;
    this.currentScreen = screenId;

    // Clean up active scanner video stream if leaving scanner
    if (this.previousScreen === 'specimen-capture' && this.activeScannerInstance) {
      this.activeScannerInstance.stopCamera();
      this.activeScannerInstance = null;
    }

    const meta = SCREENS[screenId];
    const headerEl = document.getElementById('stitch-header');
    const navEl = document.getElementById('stitch-nav');
    const viewportEl = document.getElementById('app-viewport');
    const backBtn = document.getElementById('header-back-btn');
    const brandLogo = document.getElementById('header-brand-logo');
    const headerTitle = document.getElementById('header-title-text');

    if (!viewportEl) return;

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Update Header visibility and content
    if (meta.hasHeader) {
      headerEl?.classList.remove('hidden');
      viewportEl.classList.remove('pt-0');
      viewportEl.classList.add('pt-16');

      if (meta.isSecondary) {
        backBtn?.classList.remove('hidden');
        brandLogo?.classList.add('hidden');
      } else {
        backBtn?.classList.add('hidden');
        brandLogo?.classList.remove('hidden');
      }

      if (headerTitle) {
        headerTitle.textContent = meta.headerTitle;
      }
    } else {
      headerEl?.classList.add('hidden');
      viewportEl.classList.remove('pt-16');
      viewportEl.classList.add('pt-0');
    }

    // Update Bottom Navigation visibility & active highlight
    if (meta.hasNav) {
      navEl?.classList.remove('hidden');
      viewportEl.classList.add('pb-28');
    } else {
      navEl?.classList.add('hidden');
      viewportEl.classList.remove('pb-28');
    }

    // Update Bottom Tab Active States
    const navTabs = document.querySelectorAll('.nav-tab-btn');
    navTabs.forEach((tab) => {
      const target = tab.getAttribute('data-target');
      if (target === screenId) {
        tab.className = 'nav-tab-btn flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors text-primary font-bold cursor-pointer';
      } else {
        tab.className = 'nav-tab-btn flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer';
      }
    });

    // Render Target Screen
    this.renderScreen(screenId, viewportEl);
  }

  public navigateBack(): void {
    if (this.previousScreen && this.previousScreen !== this.currentScreen) {
      this.navigateTo(this.previousScreen);
    } else {
      this.navigateTo('field-hub');
    }
  }

  private async renderScreen(screenId: ScreenId, container: HTMLElement): Promise<void> {
    switch (screenId) {
      case 'splash-welcome': {
        const view = new SplashWelcomeView(container, {
          onStart: () => this.navigateTo('field-hub'),
          onOpenFolio: () => this.navigateTo('field-journal')
        });
        view.render();
        break;
      }

      case 'field-hub': {
        const view = new HomeDashboardView(container, {
          onStartAdventure: () => this.navigateTo('adventure-mode'),
          onViewAll: () => this.navigateTo('field-journal'),
          onSelectSpecimen: (specimenId) => {
            this.selectedSpecimenId = specimenId;
            this.navigateTo('identification-result');
          },
          onOpenProfile: () => this.navigateTo('naturalist-profile')
        });
        await view.render();
        break;
      }

      case 'offline-map': {
        const view = new AdventureMapView(container, {
          onSelectSpecimen: (specimenId) => {
            this.selectedSpecimenId = specimenId;
            this.navigateTo('identification-result');
          },
          onViewFolio: () => this.navigateTo('field-journal')
        });
        view.render();
        break;
      }

      case 'specimen-capture': {
        const view = new NatureScannerView(container, {
          onCapture: (newSpecimenId) => {
            if (newSpecimenId) {
              this.selectedSpecimenId = newSpecimenId;
            }
            this.navigateTo('identification-result');
          },
          onListenForNature: () => this.navigateTo('sound-identification'),
          onOpenFolio: () => this.navigateTo('field-journal')
        });
        this.activeScannerInstance = view;
        view.render();
        break;
      }

      case 'sound-identification': {
        const view = new SoundIdentificationView(container, {
          onAddToJournal: () => this.navigateTo('field-journal')
        });
        view.render();
        break;
      }

      case 'identification-result': {
        const specimenData = await this.getSpecimenDetails(this.selectedSpecimenId);
        const view = new IdentificationResultView(
          container,
          {
            onAddToJournal: () => this.navigateTo('field-journal')
          },
          specimenData
        );
        view.render();
        break;
      }

      case 'field-journal': {
        const view = new FieldJournalView(container, {
          onSelectSpecimen: (specimenId) => {
            this.selectedSpecimenId = specimenId;
            this.navigateTo('identification-result');
          }
        });
        await view.render();
        break;
      }

      case 'adventure-mode': {
        const view = new AdventureModeView(container, {
          onSpotSpecimen: () => this.navigateTo('specimen-capture'),
          onConcludeAdventure: () => this.navigateTo('adventure-complete')
        });
        view.render();
        break;
      }

      case 'adventure-complete': {
        const view = new AdventureCompleteView(container, {
          onViewJournal: () => this.navigateTo('field-journal'),
          onStartAnother: () => this.navigateTo('adventure-mode')
        });
        view.render();
        break;
      }

      case 'naturalist-profile': {
        const view = new ProfileOutdoorYearView(container);
        view.render();
        break;
      }
    }
  }

  private async getSpecimenDetails(specimenId: string) {
    const obs = await db.getObservation(specimenId);
    if (obs) {
      return {
        id: obs.id,
        commonName: obs.commonName || 'Natural Specimen',
        scientificName: obs.scientificName || 'Unknown Taxa',
        photoUrl: obs.photoUrl,
        confidence: Math.round((obs.confidenceScore ?? 0.94) * 100),
        locationText: obs.habitat?.split('·')[0]?.trim() || 'Field Sector',
        coordsText: obs.coordinates ? `${obs.coordinates.latitude.toFixed(4)}° N, ${obs.coordinates.longitude.toFixed(4)}° E` : '19.0438° N, 73.0674° E',
        timeText: obs.readableDate.split('·')[1]?.trim() || 'Today'
      };
    }

    switch (specimenId) {
      case 'asian-koel':
        return {
          commonName: 'Asian Koel',
          scientificName: 'Eudynamys scolopaceus',
          photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZruNU5OzscDzFmOUIUrBq_rRAkMv7R9YeRyA9fWsbFGVdyE9yHiWUAjwn1MqTALLIhuMRAeuv0-0Qvemsq_VWA9qftsCctpNqit-zbPZ9fP0anyZGF6yapuhihIb9Dnh2DXvyo6gQME3Wm2dUj16Q_1n54IhQR7YQloKlq0iuhZOt0u1ft2Lj3C6NOXCtvXzWZhZGlZF4fwWc2anyK0rMy0oSWCMzx08pEju7Ykc74Ya2C82QDp9H',
          confidence: 92,
          locationText: 'Hanging Gardens',
          coordsText: '18.9553° N, 72.8055° E',
          timeText: '07:42 AM'
        };
      case 'neem':
        return {
          commonName: 'Neem Tree',
          scientificName: 'Azadirachta indica',
          photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACW9Uk4_w77Z_nUlQr5mOUZ0S6FaQWQXtHthTfRd7v0YT90G0Zl5Oz6wI62vRaJyfq_aXMIhurGZzBhDgX_NoxMkGJS60mXWCSl5BkcshECXF9dqmyyng4tRFVAQq1BZ9C08mMIBfx_XwAk05eu05TxjRJnFCJY8oReTEydd2t98M5GKOcd5V9mLncbGXZjlmK8bjFJ3QcFHS4rk0qEWrnFISCpw70Kh2aVJsd6TpeoYu7O8xzxz_s',
          confidence: 98,
          locationText: 'Sanjay Gandhi NP',
          coordsText: '19.2288° N, 72.9182° E',
          timeText: 'Yesterday'
        };
      case 'common-mormon':
        return {
          commonName: 'Common Mormon',
          scientificName: 'Papilio polytes',
          photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEOIrzEhn0yiro68Ye6UR-IloHx77QrlTYn_OVzSYPBrYPOqIqD_RLRafVus8rvnmL7VUsZEZ2k3V-S2V7feYPbWh0GsateibIoMylvA4vioqNzNXRnTki8AUblNqc6L_krl9G4l3rOjhRE-yf6UYWwfhCfHRUuWeqbG5DsQzo40LT6RfLQud9mpb27xUQx6ZKG9cxOOjgvGAMkBwIBIQ21AX7mouNzmpWP71zf1evF3VOhB09Ao51',
          confidence: 95,
          locationText: 'Aarey Milk Colony',
          coordsText: '19.1485° N, 72.8845° E',
          timeText: 'May 16'
        };
      case 'wild-orchid':
        return {
          commonName: 'Fox Brush Orchid',
          scientificName: 'Aerides maculosa',
          photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgaRJWT74EqIRstXN_SurEhVvSS8oeVcVqEF2ApvNKoRKvvMlLO2L4mifpVaNzWuSq3nl3OBbBRETwl8Zn23IrB01k403I3ISnZ0j6uSGshQNaX4YIrkb6-GmAxink5dtdgsJ3d-hwo3c_IeITVLY5RIb6GBFSXJJWkcwhYYSUS0Ytgt3ZRd_GU0xKMCrBO7vLCKeRMPYezXwWL9UR0aI_FY05Om9eLE3rh1NVPEMWYlPekQK_zonB',
          confidence: 92,
          locationText: 'Khandala Ridge',
          coordsText: '18.7618° N, 73.3768° E',
          timeText: '13:48'
        };
      default:
        return {
          commonName: 'Indian Palm Squirrel',
          scientificName: 'Funambulus palmarum',
          photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUq24kjNUYNTxx9ant7TAfN6xjpb3UCN8Pz0n8SGwbECI6fi2QCTTf08Rw5Ge9umcFh8_DgRLspfVvTWRU6X_rfLL3o3ytL4gYWdOZ2aLxiUZZHIenRLjPdmJ0C82-P3XnQYfBHFCKX1IhZo-_yHk31R-G4e4Nc6SG-P_zyj1caoetLM0zRplIe0WFMlQ_Y4clQKixljMHS-onwfNLuqVvwB5h-wenFx2oD6Y3yv3MjP-lcuXDzYKq',
          confidence: 94,
          locationText: 'Kharghar Hills',
          coordsText: '19.0438° N, 73.0674° E',
          timeText: '08:42 AM'
        };
    }
  }
}

// Bootstrap Application
window.addEventListener('DOMContentLoaded', () => {
  const app = new TrailScribeApp();
  app.init();
});
