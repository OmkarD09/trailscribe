export class AdventureCompleteView {
  private container: HTMLElement;
  private onViewJournal: () => void;
  private onStartAnother: () => void;

  constructor(
    container: HTMLElement,
    callbacks: {
      onViewJournal: () => void;
      onStartAnother: () => void;
    }
  ) {
    this.container = container;
    this.onViewJournal = callbacks.onViewJournal;
    this.onStartAnother = callbacks.onStartAnother;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-safe view-enter">
        <div class="px-margin pt-space-md flex flex-col items-center text-center">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container shadow-sm mb-space-sm">
            <span class="w-2 h-2 rounded-full bg-secondary"></span>
            <span class="font-label-sm text-label-sm tracking-widest uppercase font-bold">Expedition Concluded</span>
          </div>
          <h2 class="font-display-lg-mobile text-display-lg-mobile text-primary font-medium tracking-tight mt-1 mb-1 font-serif">
            You touched grass.
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-[320px] leading-relaxed">
            38 minutes outside. 27 minutes without looking at your phone.
          </p>
          <div class="w-full mt-space-md bg-sage-fill/40 rounded-xl p-3 flex items-center justify-between shadow-sm border border-outline-hairline/60">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-base">
                🌱
              </div>
              <div class="text-left">
                <span class="block font-title-md text-title-md text-primary leading-tight font-semibold">71% Phone-Free Presence</span>
                <span class="block font-body-sm text-body-sm text-on-surface-variant">27 uninterrupted analog minutes</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-secondary text-[22px]">verified</span>
          </div>
        </div>

        <div class="px-margin mt-space-md grid grid-cols-3 gap-space-sm">
          <div class="bg-surface-card rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm border border-outline-hairline/60">
            <span class="font-headline-md text-headline-md text-primary font-medium font-serif">2.7</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-0.5">Kilometers</span>
          </div>
          <div class="bg-surface-card rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm border border-outline-hairline/60">
            <span class="font-headline-md text-headline-md text-primary font-medium font-serif">38</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-0.5">Min Outside</span>
          </div>
          <div class="bg-surface-card rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm border border-outline-hairline/60">
            <span class="font-headline-md text-headline-md text-primary font-medium font-serif">5</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-0.5">Discoveries</span>
          </div>
        </div>

        <!-- Loop Map Card -->
        <div class="px-margin mt-space-lg">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline/60">
            <div class="flex items-center justify-between mb-space-sm">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary text-[18px]">route</span>
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Blackwood Ridge Circuit</span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant">Loop · 148m Elev</span>
            </div>
            <div class="relative w-full h-36 rounded-lg bg-surface-card-subtle overflow-hidden flex items-center justify-center">
              <svg class="w-full h-full p-2" fill="none" viewbox="0 0 340 130" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 25 C70 15, 140 35, 200 20 S310 40, 330 30" stroke="#c2c8c2" stroke-dasharray="3 3" stroke-width="1.5"></path>
                <path d="M15 65 C95 50, 160 80, 240 60 S300 85, 335 75" stroke="#c2c8c2" stroke-dasharray="3 3" stroke-width="1.5"></path>
                <path d="M5 105 C80 95, 170 115, 250 100 S310 120, 335 110" stroke="#c2c8c2" stroke-dasharray="3 3" stroke-width="1.5"></path>
                <path d="M45 75 C 65 35, 130 25, 185 45 C 235 62, 280 40, 295 72 C 305 95, 260 112, 205 105 C 145 98, 100 112, 65 92 Z" id="trail-path" stroke="#1b382b" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
                <circle cx="45" cy="75" fill="#cd8e2e" r="5"></circle>
                <circle cx="45" cy="75" r="9" stroke="#cd8e2e" stroke-opacity="0.4" stroke-width="1.5"></circle>
                <circle cx="120" cy="33" fill="#1b382b" r="3.5"></circle>
                <circle cx="185" cy="45" fill="#1b382b" r="3.5"></circle>
                <circle cx="280" cy="50" fill="#1b382b" r="3.5"></circle>
                <circle cx="230" cy="108" fill="#1b382b" r="3.5"></circle>
                <circle cx="95" cy="105" fill="#1b382b" r="3.5"></circle>
              </svg>
              <div class="absolute bottom-2 left-2 bg-obsidian-scrim text-vellum-bg px-2 py-0.5 rounded-full flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                <span class="font-label-sm text-label-sm font-mono">GPS Archived</span>
              </div>
            </div>
          </div>
        </div>

        <!-- You Found Today Horizontal Scroll Stream -->
        <div class="mt-space-lg flex flex-col">
          <div class="px-margin flex items-center justify-between mb-space-sm">
            <div class="flex items-center gap-2">
              <h3 class="font-headline-md text-headline-md text-primary font-medium leading-none font-serif">You Found Today</h3>
              <span class="font-label-sm text-label-sm bg-sage-fill text-primary px-2 py-0.5 rounded-full font-bold">5 Specimens</span>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant">Archived offline</span>
          </div>
          <div class="flex gap-space-sm overflow-x-auto px-margin pb-1">
            <div class="bg-surface-card rounded-xl p-3 shrink-0 w-44 shadow-sm flex flex-col border border-outline-hairline/60">
              <div class="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-surface-card-subtle">
                <img class="w-full h-full object-cover" alt="European Robin" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhdCi667_a99KfoIbkbT3KRL-GnFlfB-fpRZyjH2ELqaboRPsHB8uCVJHeVx2hJ7S5Dx6x7Ox3-1kPWdqL9neVXX8Ee3jSZijbQDNTlwImBN4IjRB6drAl9UMEilKVuMstTKdOmnotXiOzEF8CVa6u87W3xA-stJqK0fSO0qNAD4WXo5Vp9o-gSkHsMMRkzmb0FQaiRN7LrTliMw2KgHhwxsFgXFeQet1_OZ6gtPOWMAHwux3MCva-"/>
                <div class="absolute top-1.5 right-1.5 bg-obsidian-scrim text-vellum-bg text-xs px-1.5 py-0.5 rounded">
                  🐦 Bird
                </div>
              </div>
              <span class="font-title-md text-title-md text-primary leading-tight truncate font-serif">European Robin</span>
              <span class="font-latin-name text-latin-name italic text-secondary leading-tight mt-0.5 truncate font-serif">Erithacus rubecula</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant mt-2">10:14 AM · Ridge Trail</span>
            </div>

            <div class="bg-surface-card rounded-xl p-3 shrink-0 w-44 shadow-sm flex flex-col border border-outline-hairline/60">
              <div class="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-surface-card-subtle">
                <img class="w-full h-full object-cover" alt="Wood Sorrel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ2CXrh0AiK2lFQUzmMhb6lDK7WyRDA1wrxGttoqxLnpdjhxptjbrO7Nhf5K1oUVEAtPpE2jM2v1mpeyFKsNzWcpbJmCuGDHVrQpd66bSHiOM_N5G3JBJbDfDHDZ_DLfk1OAW01ikmijgHuecsfHV1GCm7h2maR-Jq-_ar75xM3xm9Epop-wiaG63oKQ6f380cJzfguWfRrbqn8JzgIOe7bDaM0FrhaPtb_Ocf9H3D3h5ZbpxS9Y4j"/>
                <div class="absolute top-1.5 right-1.5 bg-obsidian-scrim text-vellum-bg text-xs px-1.5 py-0.5 rounded">
                  🌿 Plant
                </div>
              </div>
              <span class="font-title-md text-title-md text-primary leading-tight truncate font-serif">Wood Sorrel</span>
              <span class="font-latin-name text-latin-name italic text-secondary leading-tight mt-0.5 truncate font-serif">Oxalis acetosella</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant mt-2">10:22 AM · Creek Bank</span>
            </div>

            <div class="bg-surface-card rounded-xl p-3 shrink-0 w-44 shadow-sm flex flex-col border border-outline-hairline/60">
              <div class="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-surface-card-subtle">
                <img class="w-full h-full object-cover" alt="Peacock Butterfly" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAexl_Qlua_q1ROjV83Rf06cAJmxVOKI0KIyRNzq_EdKabF9wJX3NsJovQ9PTvfDnSAnZ9hNjTZGM0yt4F8ip1i_q19vufUjhf-y2HO-2PyCxIA8_LNONS_mEHHn59dOqhmtG6VTnE6j_Hoi_N2atdeku3R-xtl5AHSrgAI6l2H0K_lJKWKwmyEihbn9nN7eLOYakh7v12_XxBJOiCHkWKER8i_fuLWXSQXt6DwNBf5T619wsxPohqR"/>
                <div class="absolute top-1.5 right-1.5 bg-obsidian-scrim text-vellum-bg text-xs px-1.5 py-0.5 rounded">
                  🦋 Butterfly
                </div>
              </div>
              <span class="font-title-md text-title-md text-primary leading-tight truncate font-serif">Peacock Butterfly</span>
              <span class="font-latin-name text-latin-name italic text-secondary leading-tight mt-0.5 truncate font-serif">Aglais io</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant mt-2">10:37 AM · Sunny Clearing</span>
            </div>

            <div class="bg-surface-card rounded-xl p-3 shrink-0 w-44 shadow-sm flex flex-col border border-outline-hairline/60">
              <div class="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-surface-card-subtle">
                <img class="w-full h-full object-cover" alt="English Oak" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFAc6s0PxA6AMydUT2cimz8LI1S3B_7CUWJ34xrQU3ux2ST96dLuZXn6__7QtIxOzvCX8vpvsXvdM1p7KNimkY4bW0ckRiIfRdR4LdOVV_eICHaF-ltbr6b2IG7sHcYrMk9eoqrVZc8l6qoSqg60ClhKo8kegAfua_KPMAx1om0Gr-hlgRw0KHE94Widzqx9D6naGiSxMEogo4G1-_ZdndoD1AkR2JijPHN1XskZrvVJMvynW_HJDO"/>
                <div class="absolute top-1.5 right-1.5 bg-obsidian-scrim text-vellum-bg text-xs px-1.5 py-0.5 rounded">
                  🌿 Plant
                </div>
              </div>
              <span class="font-title-md text-title-md text-primary leading-tight truncate font-serif">English Oak</span>
              <span class="font-latin-name text-latin-name italic text-secondary leading-tight mt-0.5 truncate font-serif">Quercus robur</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant mt-2">10:41 AM · Old Copse</span>
            </div>

            <div class="bg-surface-card rounded-xl p-3 shrink-0 w-44 shadow-sm flex flex-col border border-outline-hairline/60">
              <div class="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-surface-card-subtle">
                <img class="w-full h-full object-cover" alt="Goldcrest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMgK5MWU8EYxfnw9zSzPHE_G1KmWEShGW5NQ2nhVTUJYjQfAUeYMsxfiSl9VWPkyRpyrpuMOd781qnHFOF-o5q0KPnUrbYtZ0-GO-plqOYNY3noQyU_LCUY8kosa4FE8Rc88pYxvl-6GTGInk_c8_RwkY5wUhbRbYdU9t0i5DNxdpXWA06TKY1N6GxhghLML_JFQKCeAOKdkvc0VfTKIAJhiI20Ki3jxbEuF9kPmBXCz-r2beZ3Q61"/>
                <div class="absolute top-1.5 right-1.5 bg-obsidian-scrim text-vellum-bg text-xs px-1.5 py-0.5 rounded">
                  🐦 Bird
                </div>
              </div>
              <span class="font-title-md text-title-md text-primary leading-tight truncate font-serif">Goldcrest</span>
              <span class="font-latin-name text-latin-name italic text-secondary leading-tight mt-0.5 truncate font-serif">Regulus regulus</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant mt-2">10:48 AM · Pine Grove</span>
            </div>
          </div>
        </div>

        <!-- Archival Bottom Footnote & Actions -->
        <div class="px-margin mt-space-lg mb-space-md flex flex-col items-center text-center">
          <div class="flex items-center gap-1.5 text-on-surface-variant mb-space-md">
            <span class="material-symbols-outlined text-[18px] text-secondary">database</span>
            <p class="font-body-sm text-body-sm">
              Your adventure has been saved to your local on-device journal.
            </p>
          </div>
          <button class="w-full h-12 rounded-lg bg-primary-container text-vellum-bg font-title-md text-title-md flex items-center justify-center gap-2 active:bg-secondary transition-colors shadow-md cursor-pointer" id="view-journal-btn">
            <span class="material-symbols-outlined text-[20px]">auto_stories</span>
            <span>VIEW FIELD JOURNAL</span>
          </button>
          <button class="w-full h-11 mt-space-sm rounded-lg text-secondary font-title-md text-title-md flex items-center justify-center hover:bg-surface-card-subtle active:scale-98 transition-all cursor-pointer font-bold" id="new-adventure-btn">
            START ANOTHER ADVENTURE
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const journalBtn = this.container.querySelector('#view-journal-btn');
    journalBtn?.addEventListener('click', () => {
      journalBtn.classList.add('scale-95');
      setTimeout(() => {
        journalBtn.classList.remove('scale-95');
        this.onViewJournal();
      }, 150);
    });

    const newAdvBtn = this.container.querySelector('#new-adventure-btn');
    newAdvBtn?.addEventListener('click', () => {
      this.onStartAnother();
    });
  }
}
