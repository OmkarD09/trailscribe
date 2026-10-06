export class HomeDashboardView {
  private container: HTMLElement;
  private onStartAdventure: () => void;
  private onViewAll: () => void;
  private onSelectSpecimen: (specimenId: string) => void;
  private onOpenProfile: () => void;

  constructor(
    container: HTMLElement,
    callbacks: {
      onStartAdventure: () => void;
      onViewAll: () => void;
      onSelectSpecimen: (specimenId: string) => void;
      onOpenProfile: () => void;
    }
  ) {
    this.container = container;
    this.onStartAdventure = callbacks.onStartAdventure;
    this.onViewAll = callbacks.onViewAll;
    this.onSelectSpecimen = callbacks.onSelectSpecimen;
    this.onOpenProfile = callbacks.onOpenProfile;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex flex-col w-full px-margin pb-space-lg space-y-space-md view-enter">
        <!-- Greeting & Environmental Status Bar -->
        <section class="flex items-end justify-between pt-space-xs">
          <div class="flex flex-col min-w-0">
            <span class="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-bold cursor-pointer hover:underline" id="home-profile-greeting">Good Morning, Omkar</span>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="material-symbols-outlined text-tertiary-fixed-dim text-[18px]">partly_cloudy_day</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">Mumbai 27° • Partly Cloudy</span>
            </div>
          </div>
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container">
            <span class="material-symbols-outlined text-[15px]">nest_farsight_weather</span>
            <span class="font-label-sm text-label-sm font-semibold tracking-tight">AQI 48 Good</span>
          </div>
        </section>

        <!-- Hero Adventure Card -->
        <section class="relative overflow-hidden rounded-xl bg-surface-card shadow-[0_1px_3px_rgba(21,26,23,0.05),0_4px_12px_rgba(21,26,23,0.03)] p-space-md border border-outline-hairline/60">
          <!-- Tactile Corner Notching Badge -->
          <div class="flex items-center justify-between gap-2">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-amber-on-container font-bold px-2 py-0.5 rounded bg-amber-container">
              Today's Adventure
            </span>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card-subtle text-on-surface-variant">
              <span class="material-symbols-outlined text-[15px] text-secondary">wb_sunny</span>
              <span class="font-label-sm text-label-sm font-bold tracking-tight">42 MIN OUTSIDE</span>
            </div>
          </div>
          <!-- Adventure Mission Statement -->
          <div class="mt-space-md">
            <h2 class="font-display-lg-mobile text-display-lg-mobile text-primary leading-tight font-serif">
              Field Quest #18
            </h2>
            <p class="font-body-md text-body-md text-on-surface-variant mt-1.5 leading-snug">
              Discover 3 things you've never noticed before. Keep your eyes tuned to canopy fissures and bark crevices.
            </p>
          </div>
          <!-- Mini Field Progress Hint -->
          <div class="mt-space-md p-space-sm rounded-lg bg-surface-card-subtle flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-secondary"></div>
              <span class="font-body-sm text-body-sm text-on-surface font-medium">Quest Status</span>
            </div>
            <span class="font-label-md text-label-md text-secondary font-bold">1 / 3 Recorded</span>
          </div>
          <!-- Primary Action Button -->
          <button class="mt-space-md w-full h-12 rounded-lg bg-primary-container text-vellum-bg font-title-md text-title-md flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(21,26,23,0.10)] active:bg-secondary transition-all cursor-pointer" id="start-adventure-btn">
            <span>START ADVENTURE</span>
            <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </section>

        <!-- Your Week Activity Tracker -->
        <section class="rounded-xl bg-surface-card shadow-[0_1px_3px_rgba(21,26,23,0.05),0_4px_12px_rgba(21,26,23,0.03)] p-space-md border border-outline-hairline/60">
          <div class="flex items-center justify-between mb-space-sm">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-secondary text-[20px]">eco</span>
              <h3 class="font-title-md text-title-md text-primary font-bold">Your Week</h3>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">14.6 hrs field time</span>
          </div>
          <!-- Weekly Organic Growth Dial Grid -->
          <div class="grid grid-cols-7 gap-1 pt-1">
            <!-- Monday -->
            <div class="flex flex-col items-center">
              <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">M</span>
              <div class="relative w-9 h-9 my-1.5 flex items-center justify-center">
                <svg class="w-8 h-8 -rotate-90" viewbox="0 0 36 36">
                  <path class="text-surface-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3"></path>
                  <path class="text-secondary stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="75, 100" stroke-linecap="round" stroke-width="3"></path>
                </svg>
                <span class="absolute material-symbols-outlined text-[13px] text-secondary">yard</span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant">2.1h</span>
            </div>
            <!-- Tuesday -->
            <div class="flex flex-col items-center">
              <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">T</span>
              <div class="relative w-9 h-9 my-1.5 flex items-center justify-center">
                <svg class="w-8 h-8 -rotate-90" viewbox="0 0 36 36">
                  <path class="text-surface-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3"></path>
                  <path class="text-secondary stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="90, 100" stroke-linecap="round" stroke-width="3"></path>
                </svg>
                <span class="absolute material-symbols-outlined text-[13px] text-secondary">yard</span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant">3.4h</span>
            </div>
            <!-- Wednesday -->
            <div class="flex flex-col items-center">
              <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">W</span>
              <div class="relative w-9 h-9 my-1.5 flex items-center justify-center">
                <svg class="w-8 h-8 -rotate-90" viewbox="0 0 36 36">
                  <path class="text-surface-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3"></path>
                  <path class="text-secondary stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="40, 100" stroke-linecap="round" stroke-width="3"></path>
                </svg>
                <span class="absolute material-symbols-outlined text-[13px] text-secondary">nest_eco_leaf</span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant">1.0h</span>
            </div>
            <!-- Thursday -->
            <div class="flex flex-col items-center">
              <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">T</span>
              <div class="relative w-9 h-9 my-1.5 flex items-center justify-center">
                <svg class="w-8 h-8 -rotate-90" viewbox="0 0 36 36">
                  <path class="text-surface-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3"></path>
                  <path class="text-secondary stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="85, 100" stroke-linecap="round" stroke-width="3"></path>
                </svg>
                <span class="absolute material-symbols-outlined text-[13px] text-secondary">yard</span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant">2.8h</span>
            </div>
            <!-- Friday (Today - Highlighted) -->
            <div class="flex flex-col items-center p-1 rounded-lg bg-surface-card-subtle">
              <span class="font-label-sm text-label-sm text-primary font-bold">F</span>
              <div class="relative w-9 h-9 my-1 flex items-center justify-center">
                <svg class="w-8 h-8 -rotate-90" viewbox="0 0 36 36">
                  <path class="text-surface-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3"></path>
                  <path class="text-on-tertiary-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="55, 100" stroke-linecap="round" stroke-width="3.5"></path>
                </svg>
                <span class="absolute material-symbols-outlined text-[14px] text-amber-on-container">wb_sunny</span>
              </div>
              <span class="font-label-sm text-label-sm text-primary font-bold">42m</span>
            </div>
            <!-- Saturday -->
            <div class="flex flex-col items-center opacity-60">
              <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">S</span>
              <div class="relative w-9 h-9 my-1.5 flex items-center justify-center">
                <svg class="w-8 h-8" viewbox="0 0 36 36">
                  <path class="text-surface-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="2 3" stroke-width="2"></path>
                </svg>
                <span class="absolute font-label-sm text-label-sm text-on-surface-variant">•</span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant">-</span>
            </div>
            <!-- Sunday -->
            <div class="flex flex-col items-center opacity-60">
              <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">S</span>
              <div class="relative w-9 h-9 my-1.5 flex items-center justify-center">
                <svg class="w-8 h-8" viewbox="0 0 36 36">
                  <path class="text-surface-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="2 3" stroke-width="2"></path>
                </svg>
                <span class="absolute font-label-sm text-label-sm text-on-surface-variant">•</span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant">-</span>
            </div>
          </div>
        </section>

        <!-- Recent Discoveries Header -->
        <section class="space-y-space-sm pt-space-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-secondary text-[20px]">history_edu</span>
              <h3 class="font-headline-md text-headline-md text-primary font-serif">Recent Discoveries</h3>
            </div>
            <button class="font-label-sm text-label-sm tracking-wider uppercase text-secondary font-bold hover:text-primary transition-colors cursor-pointer" id="view-all-discoveries-btn">
              View All (47)
            </button>
          </div>
          <!-- Discovery Cards Stack -->
          <div class="space-y-space-sm">
            <!-- Card 1: Asian Koel -->
            <article class="recent-specimen-card flex items-center gap-space-md p-space-sm rounded-xl bg-surface-card shadow-[0_1px_3px_rgba(21,26,23,0.05),0_4px_12px_rgba(21,26,23,0.03)] active:bg-surface-card-subtle transition-colors cursor-pointer border border-outline-hairline/60" data-specimen="asian-koel">
              <div class="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                <img class="w-full h-full object-cover" alt="Asian Koel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZruNU5OzscDzFmOUIUrBq_rRAkMv7R9YeRyA9fWsbFGVdyE9yHiWUAjwn1MqTALLIhuMRAeuv0-0Qvemsq_VWA9qftsCctpNqit-zbPZ9fP0anyZGF6yapuhihIb9Dnh2DXvyo6gQME3Wm2dUj16Q_1n54IhQR7YQloKlq0iuhZOt0u1ft2Lj3C6NOXCtvXzWZhZGlZF4fwWc2anyK0rMy0oSWCMzx08pEju7Ykc74Ya2C82QDp9H"/>
                <div class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-obsidian-scrim text-vellum-bg text-[10px] font-label-sm font-bold">
                  92%
                </div>
              </div>
              <div class="flex flex-col min-w-0 flex-1 py-0.5">
                <div class="flex items-center justify-between gap-1">
                  <span class="font-label-sm text-label-sm text-on-surface-variant">07:42 AM · Hanging Gardens</span>
                  <span class="material-symbols-outlined text-[16px] text-secondary">chevron_right</span>
                </div>
                <h4 class="font-title-md text-title-md text-primary font-bold truncate mt-0.5">Asian Koel</h4>
                <span class="font-latin-name text-latin-name italic text-secondary truncate">Eudynamys scolopaceus</span>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="px-2 py-0.5 rounded bg-sage-fill text-primary font-label-md text-label-md">Bird · Native</span>
                  <span class="px-2 py-0.5 rounded bg-surface-card-subtle text-on-surface-variant font-label-md text-label-md">Diurnal</span>
                </div>
              </div>
            </article>

            <!-- Card 2: Neem Tree -->
            <article class="recent-specimen-card flex items-center gap-space-md p-space-sm rounded-xl bg-surface-card shadow-[0_1px_3px_rgba(21,26,23,0.05),0_4px_12px_rgba(21,26,23,0.03)] active:bg-surface-card-subtle transition-colors cursor-pointer border border-outline-hairline/60" data-specimen="neem">
              <div class="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                <img class="w-full h-full object-cover" alt="Neem" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACW9Uk4_w77Z_nUlQr5mOUZ0S6FaQWQXtHthTfRd7v0YT90G0Zl5Oz6wI62vRaJyfq_aXMIhurGZzBhDgX_NoxMkGJS60mXWCSl5BkcshECXF9dqmyyng4tRFVAQq1BZ9C08mMIBfx_XwAk05eu05TxjRJnFCJY8oReTEydd2t98M5GKOcd5V9mLncbGXZjlmK8bjFJ3QcFHS4rk0qEWrnFISCpw70Kh2aVJsd6TpeoYu7O8xzxz_s"/>
                <div class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-obsidian-scrim text-vellum-bg text-[10px] font-label-sm font-bold">
                  98%
                </div>
              </div>
              <div class="flex flex-col min-w-0 flex-1 py-0.5">
                <div class="flex items-center justify-between gap-1">
                  <span class="font-label-sm text-label-sm text-on-surface-variant">Yesterday · Sanjay Gandhi NP</span>
                  <span class="material-symbols-outlined text-[16px] text-secondary">chevron_right</span>
                </div>
                <h4 class="font-title-md text-title-md text-primary font-bold truncate mt-0.5">Neem</h4>
                <span class="font-latin-name text-latin-name italic text-secondary truncate">Azadirachta indica</span>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="px-2 py-0.5 rounded bg-sage-fill text-primary font-label-md text-label-md">Plant · Flora</span>
                  <span class="px-2 py-0.5 rounded bg-surface-card-subtle text-on-surface-variant font-label-md text-label-md">Medicinal</span>
                </div>
              </div>
            </article>

            <!-- Card 3: Common Mormon -->
            <article class="recent-specimen-card flex items-center gap-space-md p-space-sm rounded-xl bg-surface-card shadow-[0_1px_3px_rgba(21,26,23,0.05),0_4px_12px_rgba(21,26,23,0.03)] active:bg-surface-card-subtle transition-colors cursor-pointer border border-outline-hairline/60" data-specimen="common-mormon">
              <div class="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                <img class="w-full h-full object-cover" alt="Common Mormon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEOIrzEhn0yiro68Ye6UR-IloHx77QrlTYn_OVzSYPBrYPOqIqD_RLRafVus8rvnmL7VUsZEZ2k3V-S2V7feYPbWh0GsateibIoMylvA4vioqNzNXRnTki8AUblNqc6L_krl9G4l3rOjhRE-yf6UYWwfhCfHRUuWeqbG5DsQzo40LT6RfLQud9mpb27xUQx6ZKG9cxOOjgvGAMkBwIBIQ21AX7mouNzmpWP71zf1evF3VOhB09Ao51"/>
                <div class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-obsidian-scrim text-vellum-bg text-[10px] font-label-sm font-bold">
                  95%
                </div>
              </div>
              <div class="flex flex-col min-w-0 flex-1 py-0.5">
                <div class="flex items-center justify-between gap-1">
                  <span class="font-label-sm text-label-sm text-on-surface-variant">May 16 · Aarey Milk Colony</span>
                  <span class="material-symbols-outlined text-[16px] text-secondary">chevron_right</span>
                </div>
                <h4 class="font-title-md text-title-md text-primary font-bold truncate mt-0.5">Common Mormon</h4>
                <span class="font-latin-name text-latin-name italic text-secondary truncate">Papilio polytes</span>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="px-2 py-0.5 rounded bg-sage-fill text-primary font-label-md text-label-md">Insect · Lepidoptera</span>
                  <span class="px-2 py-0.5 rounded bg-surface-card-subtle text-on-surface-variant font-label-md text-label-md">Mimetic</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- Archival Journal Footer Note -->
        <div class="pt-space-xs text-center">
          <p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            On-device catalog • 3 specimens pending sync
          </p>
        </div>
      </div>
    `;

    // Bind Start Adventure
    const startBtn = this.container.querySelector('#start-adventure-btn');
    startBtn?.addEventListener('click', () => {
      startBtn.classList.add('scale-[0.98]');
      setTimeout(() => {
        startBtn.classList.remove('scale-[0.98]');
        this.onStartAdventure();
      }, 150);
    });

    // Bind View All
    const viewAllBtn = this.container.querySelector('#view-all-discoveries-btn');
    viewAllBtn?.addEventListener('click', () => {
      this.onViewAll();
    });

    // Bind Profile greeting link
    const greetingBtn = this.container.querySelector('#home-profile-greeting');
    greetingBtn?.addEventListener('click', () => {
      this.onOpenProfile();
    });

    // Bind specimen cards click
    const cards = this.container.querySelectorAll('.recent-specimen-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-specimen') || 'asian-koel';
        this.onSelectSpecimen(id);
      });
    });
  }
}
