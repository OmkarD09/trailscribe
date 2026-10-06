export class FieldJournalView {
  private container: HTMLElement;
  private onSelectSpecimen: (specimenId: string) => void;

  constructor(
    container: HTMLElement,
    callbacks: {
      onSelectSpecimen: (specimenId: string) => void;
    }
  ) {
    this.container = container;
    this.onSelectSpecimen = callbacks.onSelectSpecimen;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex flex-col w-full view-enter">
        <div class="px-margin pt-space-md pb-space-xs">
          <div class="flex items-center justify-between gap-space-sm">
            <span class="font-label-sm text-label-sm tracking-widest uppercase text-tertiary-fixed-dim bg-primary-container px-2.5 py-0.5 rounded-full font-bold">Folio Vol. IV</span>
            <div class="flex items-center gap-1.5 text-secondary">
              <span class="material-symbols-outlined text-[16px]">history_edu</span>
              <span class="font-label-sm text-label-sm tracking-wider uppercase font-bold">47 Entries Logged</span>
            </div>
          </div>
          <h2 class="font-headline-lg text-headline-lg text-primary mt-1 tracking-tight font-serif">Field Journal</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-0.5">Things you've discovered in the real world.</p>
        </div>

        <!-- Filter Chips Bar -->
        <div class="w-full overflow-x-auto py-space-sm pl-margin pr-space-xs flex items-center gap-2" id="journal-filter-bar">
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full bg-primary text-vellum-bg font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer" data-category="all">
            All (47)
          </button>
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full bg-surface-card text-on-surface-variant hover:text-primary font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer border border-outline-hairline/60" data-category="birds">
            Birds (19)
          </button>
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full bg-surface-card text-on-surface-variant hover:text-primary font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer border border-outline-hairline/60" data-category="plants">
            Plants (16)
          </button>
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full bg-surface-card text-on-surface-variant hover:text-primary font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer border border-outline-hairline/60" data-category="insects">
            Insects (8)
          </button>
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full bg-surface-card text-on-surface-variant hover:text-primary font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer border border-outline-hairline/60" data-category="sounds">
            Sounds (4)
          </button>
        </div>

        <!-- Expedition Sector Indicator -->
        <div class="px-margin py-space-xs">
          <div class="bg-surface-card rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-sm border border-outline-hairline/60">
            <div class="flex items-center gap-2 min-w-0">
              <span class="material-symbols-outlined text-secondary text-[20px]">auto_stories</span>
              <span class="font-body-sm text-body-sm text-on-surface font-semibold truncate">Monsoon Expedition 2024</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <span class="font-label-sm text-label-sm text-secondary font-bold">Kharghar Hills Sector</span>
              <span class="material-symbols-outlined text-secondary text-[16px]">tune</span>
            </div>
          </div>
        </div>

        <!-- Specimen Masonry Grid -->
        <div class="px-margin pt-space-sm pb-space-lg">
          <div class="grid grid-cols-2 gap-3.5 items-start" id="specimen-masonry">
            <!-- Card 1: Asian Koel -->
            <article class="specimen-masonry-card flex flex-col bg-surface-card rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-outline-hairline/60" data-type="birds" data-id="asian-koel">
              <div class="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
                <img class="w-full h-full object-cover" alt="Asian Koel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCUa7mlEqL-Zl5MFy4hnfhdb1rSjhFiMP1X2DNG6Vo5QovjzpAhGZsqbSaUoPeyOcac-PgnfeM8FFl_kPrsPvaOnNMTifalb_GSZB8s5oB8VO9tc_ONVjzW9A-j8k015iT3EKJtrBT4ayxnjnMgbAmtNRkMPd-wXFa8Lfohw3pwxzB24U3-dsErWXk_cjLbviD12wqubyzkz1azwasGYEuckAoJmtzvlJmLCNsWLQbH_kn2pvGy8vb"/>
                <div class="absolute top-2 right-2 bg-obsidian-scrim px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                  <span class="font-label-sm text-label-sm text-vellum-bg font-bold">92%</span>
                </div>
                <div class="absolute bottom-2 left-2 bg-obsidian-scrim/80 px-2 py-0.5 rounded-md">
                  <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-widest font-semibold">BIRD</span>
                </div>
              </div>
              <div class="p-3 flex flex-col">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim font-bold tracking-wider uppercase">#047 · 14 OCT</span>
                <h3 class="font-headline-md text-headline-md text-primary leading-tight mt-0.5 font-serif">Asian Koel</h3>
                <p class="font-latin-name text-latin-name italic text-secondary leading-snug">Eudynamys scolopaceus</p>
                <div class="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-card-subtle px-2 py-1 rounded-lg">
                  <span class="font-body-sm text-body-sm truncate flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                    Kharghar
                  </span>
                  <span class="material-symbols-outlined text-[15px] text-secondary">bookmark_border</span>
                </div>
              </div>
            </article>

            <!-- Card 2: Neem Tree -->
            <article class="specimen-masonry-card flex flex-col bg-surface-card rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-outline-hairline/60" data-type="plants" data-id="neem">
              <div class="relative w-full aspect-[4/6] bg-surface-container overflow-hidden">
                <img class="w-full h-full object-cover" alt="Neem Tree" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU5AyQmau62lXdjO44GXKkEft5pqUqvNCMNxkjCAHjj75_bUCNfvaKU8nS--flHUqJRWeYl1kPQ0wItC7_DfVdrcibFZDWYWKV3m7pAJfmsKV708cDqoM8K8p7ccy-4P079Jdd9QB4-jP2wRVwDQm_SLZiSG34vcFg3phjF1eMJSTX7jm-omRWuHwDOqFDjE6yFaXQglUdRWGqdK8mMqCWxtMxohbilvn3RBxgUqMKYMsEsyjUaAYJ"/>
                <div class="absolute top-2 right-2 bg-obsidian-scrim px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                  <span class="font-label-sm text-label-sm text-vellum-bg font-bold">98%</span>
                </div>
                <div class="absolute bottom-2 left-2 bg-obsidian-scrim/80 px-2 py-0.5 rounded-md">
                  <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-widest font-semibold">FLORA</span>
                </div>
              </div>
              <div class="p-3 flex flex-col">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim font-bold tracking-wider uppercase">#046 · 13 OCT</span>
                <h3 class="font-headline-md text-headline-md text-primary leading-tight mt-0.5 font-serif">Neem Tree</h3>
                <p class="font-latin-name text-latin-name italic text-secondary leading-snug">Azadirachta indica</p>
                <div class="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-card-subtle px-2 py-1 rounded-lg">
                  <span class="font-body-sm text-body-sm truncate flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                    Sanjay Gandhi NP
                  </span>
                  <span class="material-symbols-outlined text-[15px] text-secondary">bookmark_border</span>
                </div>
              </div>
            </article>

            <!-- Card 3: Common Mormon -->
            <article class="specimen-masonry-card flex flex-col bg-surface-card rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-outline-hairline/60" data-type="insects" data-id="common-mormon">
              <div class="relative w-full aspect-[4/6] bg-surface-container overflow-hidden">
                <img class="w-full h-full object-cover" alt="Common Mormon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT3qpPWyD9lk7pWCCdSqhBFPxILzAfrKBPmcsxoe3RlYfo057N72NTx5vMa_z4AMU2j34ae_Uy4qkyFb7_eUv8zEb5Cl31EsrvFp2rwpRnekpK9Tew1MFmBUndkS3jh_j3JobAUg2SXg94UcaaemUy7A22Dh5AydCOhQQsYTmC_eFivTZHlt-6RuwxIzvpvEgkXPZxO42BCl-pNBasTtnD5xVTUNEpdCv1TAYX6jAvXd8zSKJnrB6l"/>
                <div class="absolute top-2 right-2 bg-obsidian-scrim px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                  <span class="font-label-sm text-label-sm text-vellum-bg font-bold">95%</span>
                </div>
                <div class="absolute bottom-2 left-2 bg-obsidian-scrim/80 px-2 py-0.5 rounded-md">
                  <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-widest font-semibold">BUTTERFLY</span>
                </div>
              </div>
              <div class="p-3 flex flex-col">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim font-bold tracking-wider uppercase">#045 · 11 OCT</span>
                <h3 class="font-headline-md text-headline-md text-primary leading-tight mt-0.5 font-serif">Common Mormon</h3>
                <p class="font-latin-name text-latin-name italic text-secondary leading-snug">Papilio polytes</p>
                <div class="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-card-subtle px-2 py-1 rounded-lg">
                  <span class="font-body-sm text-body-sm truncate flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                    Kharghar
                  </span>
                  <span class="material-symbols-outlined text-[15px] text-secondary">bookmark_border</span>
                </div>
              </div>
            </article>

            <!-- Card 4: Indian Palm Squirrel -->
            <article class="specimen-masonry-card flex flex-col bg-surface-card rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-outline-hairline/60" data-type="fauna" data-id="palm-squirrel">
              <div class="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
                <img class="w-full h-full object-cover" alt="Indian Palm Squirrel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNlVLuGdHKv-4yplLjCCbiTw-ItlKsN5BVWRXaifA4GELbp01JYKNQFWffLlOgkGfiMNsKS_T76y1PNZsIEYCvakUL8O20ihomw14797PB7Su4-Yt3F2uqu6JKrPJYDhfE9IheLdPOnA6HD2E1CU9JmrzADqagcFXlHTeBYIQM6n96Tn5PYPSRXQXI6Vy9LZzXaQht6EWxWPjWma-_Y3h40lLz9Igr8OajL-7QxHFHeQzK7XO4Ae1J"/>
                <div class="absolute top-2 right-2 bg-obsidian-scrim px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                  <span class="font-label-sm text-label-sm text-vellum-bg font-bold">94%</span>
                </div>
                <div class="absolute bottom-2 left-2 bg-obsidian-scrim/80 px-2 py-0.5 rounded-md">
                  <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-widest font-semibold">FAUNA</span>
                </div>
              </div>
              <div class="p-3 flex flex-col">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim font-bold tracking-wider uppercase">#044 · 09 OCT</span>
                <h3 class="font-headline-md text-headline-md text-primary leading-tight mt-0.5 font-serif">Indian Palm Squirrel</h3>
                <p class="font-latin-name text-latin-name italic text-secondary leading-snug">Funambulus palmarum</p>
                <div class="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-card-subtle px-2 py-1 rounded-lg">
                  <span class="font-body-sm text-body-sm truncate flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                    Aarey Colony
                  </span>
                  <span class="material-symbols-outlined text-[15px] text-secondary">bookmark_border</span>
                </div>
              </div>
            </article>

            <!-- Card 5: Blue Gentian -->
            <article class="specimen-masonry-card flex flex-col bg-surface-card rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-outline-hairline/60" data-type="plants" data-id="blue-gentian">
              <div class="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
                <img class="w-full h-full object-cover" alt="Blue Gentian" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMKaAZnQ9rrr4zSotsrGekZ8vIGl7TQ_WyjgpIeT_T8JSvTd7ZXgqUZZpzlyRJqQryMQLjy1_tzC-2vk_QGWKVzqZjAVP1PKa8cipX75PgAqNvUqQo_LNyNBiFlOrkZhxdDyd2VcYH6nGCHh1gVCTOzwL4RylN1yaizkyn8eXzhu9YCYZehimsOZRU66t8BP9U8ua1w95CDSu50TY-Skoe1GG36-xjXPrSmX9EmAbUdUD_HpH_RcMu"/>
                <div class="absolute top-2 right-2 bg-obsidian-scrim px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                  <span class="font-label-sm text-label-sm text-vellum-bg font-bold">89%</span>
                </div>
                <div class="absolute bottom-2 left-2 bg-obsidian-scrim/80 px-2 py-0.5 rounded-md">
                  <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-widest font-semibold">WILDFLOWER</span>
                </div>
              </div>
              <div class="p-3 flex flex-col">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim font-bold tracking-wider uppercase">#043 · 04 OCT</span>
                <h3 class="font-headline-md text-headline-md text-primary leading-tight mt-0.5 font-serif">Blue Gentian</h3>
                <p class="font-latin-name text-latin-name italic text-secondary leading-snug">Gentiana kurroo</p>
                <div class="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-card-subtle px-2 py-1 rounded-lg">
                  <span class="font-body-sm text-body-sm truncate flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                    Matheran
                  </span>
                  <span class="material-symbols-outlined text-[15px] text-secondary">bookmark_border</span>
                </div>
              </div>
            </article>

            <!-- Card 6: Spotted Owlet Sound -->
            <article class="specimen-masonry-card flex flex-col bg-surface-card rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-outline-hairline/60" data-type="sounds" data-id="spotted-owlet-sound">
              <div class="relative w-full aspect-[4/6] bg-primary-container overflow-hidden flex flex-col justify-between p-3">
                <div class="flex items-center justify-between">
                  <div class="bg-obsidian-scrim px-2 py-0.5 rounded-md">
                    <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-widest font-semibold">BIRD SOUND</span>
                  </div>
                  <div class="bg-obsidian-scrim px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                    <span class="font-label-sm text-label-sm text-vellum-bg font-bold">91%</span>
                  </div>
                </div>
                <div class="py-4 flex flex-col items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-tertiary-fixed-dim text-primary flex items-center justify-center shadow-md mb-2">
                    <span class="material-symbols-outlined text-[24px]">graphic_eq</span>
                  </div>
                  <div class="w-full flex items-center justify-center gap-0.5 h-8">
                    <span class="w-1 h-3 bg-sage-fill rounded-full animate-pulse"></span>
                    <span class="w-1 h-5 bg-tertiary-fixed-dim rounded-full"></span>
                    <span class="w-1 h-8 bg-sage-fill rounded-full"></span>
                    <span class="w-1 h-4 bg-tertiary-fixed-dim rounded-full"></span>
                    <span class="w-1 h-7 bg-sage-fill rounded-full"></span>
                    <span class="w-1 h-3 bg-sage-fill rounded-full"></span>
                    <span class="w-1 h-6 bg-tertiary-fixed-dim rounded-full"></span>
                    <span class="w-1 h-2 bg-sage-fill rounded-full"></span>
                  </div>
                  <span class="font-label-sm text-label-sm text-sage-fill tracking-widest uppercase mt-1">2.4 kHz · Dual Trill</span>
                </div>
                <span class="font-label-sm text-label-sm text-secondary-fixed-dim tracking-wider">Acoustic Audio ID #829</span>
              </div>
              <div class="p-3 flex flex-col">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim font-bold tracking-wider uppercase">#042 · 02 OCT</span>
                <h3 class="font-headline-md text-headline-md text-primary leading-tight mt-0.5 font-serif">Spotted Owlet</h3>
                <p class="font-latin-name text-latin-name italic text-secondary leading-snug">Athene brama</p>
                <div class="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-card-subtle px-2 py-1 rounded-lg">
                  <span class="font-body-sm text-body-sm truncate flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                    Yeoor
                  </span>
                  <span class="material-symbols-outlined text-[15px] text-secondary">bookmark_border</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Archival Local Sync Card -->
        <div class="px-margin pb-space-xl">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex flex-col items-center text-center border border-outline-hairline/60">
            <div class="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-2">
              <span class="material-symbols-outlined text-[20px]">cloud_sync</span>
            </div>
            <span class="font-title-md text-title-md text-primary font-bold">Folio Synced Locally</span>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-[280px]">
              All 47 botanical plates, audio spectrograms, and coordinates stored securely in your phone's memory.
            </p>
            <div class="mt-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
              <span class="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Storage: 84.2 MB Cached</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const filterBtns = this.container.querySelectorAll('.journal-filter-btn');
    const cards = this.container.querySelectorAll('.specimen-masonry-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');

        filterBtns.forEach((b) => {
          b.classList.remove('bg-primary', 'text-vellum-bg');
          b.classList.add('bg-surface-card', 'text-on-surface-variant');
        });
        btn.classList.add('bg-primary', 'text-vellum-bg');
        btn.classList.remove('bg-surface-card', 'text-on-surface-variant');

        cards.forEach((cardEl) => {
          const card = cardEl as HTMLElement;
          const type = card.getAttribute('data-type');
          if (cat === 'all' || type === cat || (cat === 'birds' && type === 'birds') || (cat === 'plants' && type === 'plants')) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id') || 'asian-koel';
        this.onSelectSpecimen(id);
      });
    });
  }
}
