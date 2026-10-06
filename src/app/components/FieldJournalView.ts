import { db } from '../../storage/db';
import type { FieldObservation } from '../../storage/types';

export class FieldJournalView {
  private container: HTMLElement;
  private onSelectSpecimen: (specimenId: string) => void;
  private activeCategory: string = 'all';
  private observations: FieldObservation[] = [];

  constructor(
    container: HTMLElement,
    callbacks: {
      onSelectSpecimen: (specimenId: string) => void;
    }
  ) {
    this.container = container;
    this.onSelectSpecimen = callbacks.onSelectSpecimen;
  }

  async render(): Promise<void> {
    this.observations = await db.getAllObservations();

    const totalCount = this.observations.length;
    const birdsCount = this.observations.filter((o) => o.kingdomOrGroup === 'Aves').length;
    const plantsCount = this.observations.filter((o) => o.kingdomOrGroup === 'Plantae').length;
    const insectsCount = this.observations.filter((o) => o.kingdomOrGroup === 'Insecta').length;
    const soundsCount = this.observations.filter(
      (o) => o.audioBlob !== undefined || o.habitat?.toLowerCase().includes('acoustic') || o.rawTranscript?.toLowerCase().includes('call') || o.commonName?.toLowerCase().includes('owlet')
    ).length;

    this.container.innerHTML = `
      <div class="flex flex-col w-full view-enter">
        <div class="px-margin pt-space-md pb-space-xs">
          <div class="flex items-center justify-between gap-space-sm">
            <span class="font-label-sm text-label-sm tracking-widest uppercase text-tertiary-fixed-dim bg-primary-container px-2.5 py-0.5 rounded-full font-bold">Folio Vol. IV</span>
            <div class="flex items-center gap-1.5 text-secondary">
              <span class="material-symbols-outlined text-[16px]">history_edu</span>
              <span class="font-label-sm text-label-sm tracking-wider uppercase font-bold" id="journal-total-count-badge">${totalCount} Entries Logged</span>
            </div>
          </div>
          <h2 class="font-headline-lg text-headline-lg text-primary mt-1 tracking-tight font-serif">Field Journal</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-0.5">Things you've discovered in the real world.</p>
        </div>

        <!-- Filter Chips Bar -->
        <div class="w-full overflow-x-auto py-space-sm pl-margin pr-space-xs flex items-center gap-2" id="journal-filter-bar">
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full ${this.activeCategory === 'all' ? 'bg-primary text-vellum-bg' : 'bg-surface-card text-on-surface-variant border border-outline-hairline/60'} font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer" data-category="all">
            All (${totalCount})
          </button>
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full ${this.activeCategory === 'birds' ? 'bg-primary text-vellum-bg' : 'bg-surface-card text-on-surface-variant border border-outline-hairline/60'} font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer" data-category="birds">
            Birds (${birdsCount})
          </button>
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full ${this.activeCategory === 'plants' ? 'bg-primary text-vellum-bg' : 'bg-surface-card text-on-surface-variant border border-outline-hairline/60'} font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer" data-category="plants">
            Plants (${plantsCount})
          </button>
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full ${this.activeCategory === 'insects' ? 'bg-primary text-vellum-bg' : 'bg-surface-card text-on-surface-variant border border-outline-hairline/60'} font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer" data-category="insects">
            Insects (${insectsCount})
          </button>
          <button class="journal-filter-btn shrink-0 px-3.5 py-1.5 rounded-full ${this.activeCategory === 'sounds' ? 'bg-primary text-vellum-bg' : 'bg-surface-card text-on-surface-variant border border-outline-hairline/60'} font-label-md text-label-md tracking-wider uppercase shadow-sm transition-all cursor-pointer" data-category="sounds">
            Sounds (${soundsCount})
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
            ${this.renderCardsHtml(this.observations)}
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
              All ${totalCount} botanical plates, audio spectrograms, and coordinates stored securely in your phone's memory.
            </p>
            <div class="mt-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
              <span class="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">IndexedDB: ${totalCount} Specimens Cached</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderCardsHtml(items: FieldObservation[]): string {
    if (items.length === 0) {
      return `
        <div class="col-span-2 py-12 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl text-secondary mb-2">search_off</span>
          <p class="font-title-md text-title-md font-serif text-primary">No specimens found</p>
          <p class="font-body-sm text-body-sm mt-1">Try switching categories or exploring outdoors.</p>
        </div>
      `;
    }

    return items
      .map((obs, idx) => {
        const isSound =
          obs.audioBlob !== undefined ||
          obs.habitat?.toLowerCase().includes('acoustic') ||
          obs.rawTranscript?.toLowerCase().includes('call') ||
          obs.commonName?.toLowerCase().includes('owlet');

        const catType = this.getCategoryType(obs);
        const seqNumber = `#${String(items.length - idx).padStart(3, '0')}`;
        const confPct = Math.round((obs.confidenceScore ?? 0.94) * 100);
        const groupBadge = this.getGroupBadgeText(obs);
        const dateStr = obs.readableDate.split('·')[0]?.trim() || 'TODAY';
        const locationShort = obs.habitat?.split(',')[0]?.split(' ')[0] || 'Field';

        if (isSound) {
          // Acoustic Sound Card Presentation
          return `
            <article class="specimen-masonry-card flex flex-col bg-surface-card rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-outline-hairline/60" data-type="sounds" data-id="${obs.id}">
              <div class="relative w-full aspect-[4/5] bg-primary text-vellum-bg overflow-hidden flex flex-col justify-between p-3">
                <div class="flex items-center justify-between">
                  <div class="bg-obsidian-scrim px-2 py-0.5 rounded-md">
                    <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-widest font-semibold">BIO-ACOUSTIC</span>
                  </div>
                  <div class="bg-obsidian-scrim px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                    <span class="font-label-sm text-label-sm text-vellum-bg font-bold">${confPct}%</span>
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
                  <span class="font-label-sm text-label-sm text-sage-fill tracking-widest uppercase mt-1">2.4 kHz · Harmonic</span>
                </div>
                <span class="font-label-sm text-label-sm text-secondary-fixed-dim tracking-wider font-mono">Acoustic ID ${seqNumber}</span>
              </div>
              <div class="p-3 flex flex-col">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim font-bold tracking-wider uppercase">${seqNumber} · ${dateStr.toUpperCase()}</span>
                <h3 class="font-headline-md text-headline-md text-primary leading-tight mt-0.5 font-serif truncate">${obs.commonName || 'Spotted Owlet'}</h3>
                <p class="font-latin-name text-latin-name italic text-secondary leading-snug truncate">${obs.scientificName || 'Athene brama'}</p>
                <div class="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-card-subtle px-2 py-1 rounded-lg">
                  <span class="font-body-sm text-body-sm truncate flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                    ${locationShort}
                  </span>
                  <span class="material-symbols-outlined text-[15px] text-secondary">bookmark_border</span>
                </div>
              </div>
            </article>
          `;
        }

        // Photographic Specimen Plate
        const aspectClass = idx % 2 === 0 ? 'aspect-[4/5]' : 'aspect-[4/6]';
        const photoUrl =
          obs.photoUrl ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDCUa7mlEqL-Zl5MFy4hnfhdb1rSjhFiMP1X2DNG6Vo5QovjzpAhGZsqbSaUoPeyOcac-PgnfeM8FFl_kPrsPvaOnNMTifalb_GSZB8s5oB8VO9tc_ONVjzW9A-j8k015iT3EKJtrBT4ayxnjnMgbAmtNRkMPd-wXFa8Lfohw3pwxzB24U3-dsErWXk_cjLbviD12wqubyzkz1azwasGYEuckAoJmtzvlJmLCNsWLQbH_kn2pvGy8vb';

        return `
          <article class="specimen-masonry-card flex flex-col bg-surface-card rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-outline-hairline/60" data-type="${catType}" data-id="${obs.id}">
            <div class="relative w-full ${aspectClass} bg-surface-container overflow-hidden">
              <img class="w-full h-full object-cover" alt="${obs.commonName || 'Specimen'}" src="${photoUrl}"/>
              <div class="absolute top-2 right-2 bg-obsidian-scrim px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
                <span class="font-label-sm text-label-sm text-vellum-bg font-bold">${confPct}%</span>
              </div>
              <div class="absolute bottom-2 left-2 bg-obsidian-scrim/80 px-2 py-0.5 rounded-md">
                <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-widest font-semibold">${groupBadge}</span>
              </div>
            </div>
            <div class="p-3 flex flex-col">
              <span class="font-label-sm text-label-sm text-tertiary-fixed-dim font-bold tracking-wider uppercase">${seqNumber} · ${dateStr.toUpperCase()}</span>
              <h3 class="font-headline-md text-headline-md text-primary leading-tight mt-0.5 font-serif truncate">${obs.commonName || 'Natural Specimen'}</h3>
              <p class="font-latin-name text-latin-name italic text-secondary leading-snug truncate">${obs.scientificName || 'Unknown Taxa'}</p>
              <div class="mt-2.5 pt-2 flex items-center justify-between text-on-surface-variant bg-surface-card-subtle px-2 py-1 rounded-lg">
                <span class="font-body-sm text-body-sm truncate flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                  ${locationShort}
                </span>
                <span class="material-symbols-outlined text-[15px] text-secondary">bookmark_border</span>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  private getCategoryType(obs: FieldObservation): string {
    if (obs.kingdomOrGroup === 'Aves') return 'birds';
    if (obs.kingdomOrGroup === 'Plantae') return 'plants';
    if (obs.kingdomOrGroup === 'Insecta') return 'insects';
    if (obs.audioBlob !== undefined) return 'sounds';
    return 'fauna';
  }

  private getGroupBadgeText(obs: FieldObservation): string {
    if (obs.kingdomOrGroup === 'Aves') return 'BIRD';
    if (obs.kingdomOrGroup === 'Plantae') return 'FLORA';
    if (obs.kingdomOrGroup === 'Insecta') return 'INSECT';
    if (obs.kingdomOrGroup === 'Animalia') return 'FAUNA';
    return 'SPECIMEN';
  }

  private bindEvents(): void {
    const filterBtns = this.container.querySelectorAll('.journal-filter-btn');
    const cards = this.container.querySelectorAll('.specimen-masonry-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category') || 'all';
        this.activeCategory = cat;

        filterBtns.forEach((b) => {
          b.classList.remove('bg-primary', 'text-vellum-bg');
          b.classList.add('bg-surface-card', 'text-on-surface-variant', 'border', 'border-outline-hairline/60');
        });
        btn.classList.add('bg-primary', 'text-vellum-bg');
        btn.classList.remove('bg-surface-card', 'text-on-surface-variant', 'border');

        cards.forEach((cardEl) => {
          const card = cardEl as HTMLElement;
          const type = card.getAttribute('data-type');
          if (
            cat === 'all' ||
            type === cat ||
            (cat === 'birds' && type === 'birds') ||
            (cat === 'plants' && type === 'plants') ||
            (cat === 'insects' && type === 'insects') ||
            (cat === 'sounds' && type === 'sounds')
          ) {
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
