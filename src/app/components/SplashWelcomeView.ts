export class SplashWelcomeView {
  private container: HTMLElement;
  private onStart: () => void;
  private onOpenFolio: () => void;

  constructor(
    container: HTMLElement,
    callbacks: {
      onStart: () => void;
      onOpenFolio: () => void;
    }
  ) {
    this.container = container;
    this.onStart = callbacks.onStart;
    this.onOpenFolio = callbacks.onOpenFolio;
  }

  render(): void {
    this.container.innerHTML = `
      <main class="flex flex-col relative w-full bg-vellum-bg min-h-screen view-enter">
        <div class="flex flex-col w-full relative overflow-hidden select-none">
          <!-- Immersive Cinematic Forest Canopy Background -->
          <div class="relative w-full min-h-[780px] flex flex-col justify-between p-space-md">
            <!-- Background Image Layer with Atmospheric Depth -->
            <div class="absolute inset-0 bg-cover bg-center w-full h-full scale-105 transition-transform duration-1000 ease-out" id="hero-bg" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCWpjE1feCcQ8EusB_dD_Y7vVqODE-WSMfjHRlXVsVQ2JmVpJnO6bGysFaw4FRa6qJ5Wk1H294oZjQMlgILmFWdLWO_WwBN8VhCVR3zB27AtXpPXr486AYN2sRI_2Amysju8fplcMvGhtNtDl7-YoC_dSQHCTJOJ1uCaKwDxH_D_0CPVjIzzPgKxO1MtX8TvDdGVuK9w8CjakSbx510h6lif2HsZDUwgUnFKhlZnFi4FnnA7B_K96QE')"></div>
            <!-- Multi-stage Dark Obsidian Gradient Scrim for Editorial Legibility -->
            <div class="absolute inset-0 bg-gradient-to-b from-primary/70 via-obsidian-scrim/80 to-primary"></div>
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-container/10 via-transparent to-primary/90"></div>
            
            <!-- Top Instrumentation Bar: Subtle Offline Signal -->
            <header class="relative z-10 flex items-center justify-between pt-2">
              <div class="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-primary-container/80 backdrop-blur-md shadow-sm">
                <span class="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                <span class="font-label-sm text-label-sm tracking-widest text-primary-fixed uppercase font-semibold">Autonomous Engine Ready</span>
              </div>
              <div class="font-label-sm text-label-sm tracking-wider text-outline-variant/75 flex items-center gap-1 font-mono">
                <span class="material-symbols-outlined text-[14px]">explore</span>
                <span>45.372° N · 121.697° W</span>
              </div>
            </header>

            <!-- Mid Section: Brand Identity & Dramatic Headline Typography -->
            <div class="relative z-10 flex flex-col items-center text-center mt-6 mb-2">
              <div class="relative mb-5 group cursor-pointer" id="brand-emblem">
                <div class="absolute -inset-2 bg-on-tertiary-container/20 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <img alt="TrailScribe Logo" class="relative w-20 h-20 object-contain drop-shadow-md rounded-xl bg-surface-card/10 backdrop-blur-sm p-2 transition-transform duration-500 ease-out group-hover:scale-105" src="https://lh3.googleusercontent.com/aida/AEtjO1UJ4ad2LiDWHiIqCsFCgBI-5mZwdOsdoGnzGk6iZZZBTHS8UbsNGwzBsHkal0MDptQEHd4Wee8VpaCJbcaF_mMj2a5jpECvt-LCdqR77l5a86ncPV1BN4f-FMHRsFl4KYPvGxvYuwGQ6bnY1zgC8RmW_sZYWEqOA5bpFUFhqnI_5jN1JBYLnEdISXTsA1TmCLePr1j4DGcU_8IpHs2AIlQKoygreZR0-odP5qkZ0JvKaHMMZkvvzATGHA"/>
              </div>
              <div class="font-label-md text-label-md tracking-[0.25em] text-on-tertiary-container uppercase font-semibold mb-2 drop-shadow-sm">
                T R A I L S C R I B E
              </div>
              <h1 class="font-display-lg-mobile text-display-lg-mobile text-surface-card leading-[1.15] tracking-tight max-w-[320px] drop-shadow-md font-serif">
                SEE MORE.<br/>
                <span class="font-headline-lg italic font-normal text-secondary-fixed">GO OUTSIDE.</span>
              </h1>
              <p class="font-body-md text-body-md text-surface-variant max-w-[280px] mt-3 leading-relaxed drop-shadow">
                An offline AI companion for the living world outside your screen.
              </p>
            </div>

            <!-- Lower Section: Core Pillar Value Cards & Tactical CTA -->
            <div class="relative z-10 flex flex-col gap-space-md w-full max-w-md mx-auto">
              <div class="grid grid-cols-3 gap-2 py-1">
                <div class="flex flex-col items-center text-center p-2.5 rounded-lg bg-primary-container/60 backdrop-blur-md transition-all duration-300 hover:bg-primary-container/80">
                  <div class="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center mb-1.5 text-on-tertiary-container">
                    <span class="material-symbols-outlined text-[18px]">bolt</span>
                  </div>
                  <span class="font-label-sm text-label-sm text-surface-card font-semibold leading-tight">Instant<br/>Local ID</span>
                  <span class="font-label-sm text-[10px] text-outline-variant mt-0.5">Under 50ms</span>
                </div>
                <div class="flex flex-col items-center text-center p-2.5 rounded-lg bg-primary-container/60 backdrop-blur-md transition-all duration-300 hover:bg-primary-container/80">
                  <div class="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center mb-1.5 text-on-tertiary-container">
                    <span class="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                  <span class="font-label-sm text-label-sm text-surface-card font-semibold leading-tight">100% Private<br/>On-Device</span>
                  <span class="font-label-sm text-[10px] text-outline-variant mt-0.5">Zero Cloud</span>
                </div>
                <div class="flex flex-col items-center text-center p-2.5 rounded-lg bg-primary-container/60 backdrop-blur-md transition-all duration-300 hover:bg-primary-container/80">
                  <div class="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center mb-1.5 text-on-tertiary-container">
                    <span class="material-symbols-outlined text-[18px]">menu_book</span>
                  </div>
                  <span class="font-label-sm text-label-sm text-surface-card font-semibold leading-tight">Personal<br/>Field Folio</span>
                  <span class="font-label-sm text-[10px] text-outline-variant mt-0.5">Archival Log</span>
                </div>
              </div>

              <!-- Action Anchor Group -->
              <div class="flex flex-col gap-2.5 mt-1">
                <button class="w-full h-12 rounded-lg bg-on-tertiary-container hover:bg-tertiary-fixed-dim active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer" id="btn-start" type="button">
                  <span class="font-title-md text-title-md text-tertiary font-bold tracking-wide">START EXPLORING</span>
                  <span class="material-symbols-outlined text-tertiary text-[20px]">arrow_forward</span>
                </button>
                <button class="w-full py-2 flex items-center justify-center gap-1.5 text-surface-variant hover:text-surface-card transition-colors duration-150 cursor-pointer" id="btn-open-folio" type="button">
                  <span class="font-body-sm text-body-sm text-outline-variant">Already keeping records?</span>
                  <span class="font-body-sm text-body-sm text-secondary-fixed underline underline-offset-4 font-medium">Open Folio</span>
                </button>
              </div>

              <!-- Archival Assurance Footnote -->
              <footer class="flex items-center justify-center gap-2 pb-2 text-center text-outline-variant">
                <span class="material-symbols-outlined text-[14px] text-on-tertiary-container">satellite_alt</span>
                <p class="font-label-sm text-label-sm tracking-wide uppercase opacity-80">
                  Works offline • Your data stays on your device
                </p>
              </footer>
            </div>
          </div>
        </div>
      </main>
    `;

    // Bind triggers
    const startBtn = this.container.querySelector('#btn-start');
    startBtn?.addEventListener('click', () => {
      startBtn.classList.add('scale-95');
      setTimeout(() => {
        startBtn.classList.remove('scale-95');
        this.onStart();
      }, 150);
    });

    const folioBtn = this.container.querySelector('#btn-open-folio');
    folioBtn?.addEventListener('click', () => {
      this.onOpenFolio();
    });
  }
}
