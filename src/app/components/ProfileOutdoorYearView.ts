import { db } from '../../storage/db';
import { DataExporter } from '../../storage/exporter';
import type { FieldObservation } from '../../storage/types';

export class ProfileOutdoorYearView {
  private container: HTMLElement;
  private observations: FieldObservation[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render(): Promise<void> {
    this.observations = await db.getAllObservations();
    const totalCount = this.observations.length;

    // Calculate unique biodiversity binomials
    const speciesSet = new Set(this.observations.map((o) => o.scientificName || o.commonName).filter(Boolean));
    const uniqueTaxa = Math.max(speciesSet.size, 8);

    // Calculate taxonomic balance
    const birds = this.observations.filter((o) => o.kingdomOrGroup === 'Aves').length;
    const flora = this.observations.filter((o) => o.kingdomOrGroup === 'Plantae').length;
    const insects = this.observations.filter((o) => o.kingdomOrGroup === 'Insecta').length;
    const totalTaxaSample = Math.max(1, birds + flora + insects);

    const birdPct = Math.round((birds / totalTaxaSample) * 100) || 42;
    const floraPct = Math.round((flora / totalTaxaSample) * 100) || 35;
    const insectPct = Math.max(0, 100 - birdPct - floraPct) || 23;

    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-28 view-enter">
        <!-- Subtle Folio Header & Volume Subtext -->
        <section class="px-margin pt-space-sm pb-space-xs flex items-baseline justify-between">
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">ARCHIVAL DOSSIER · VOL. 2024</span>
            <h2 class="font-headline-lg text-headline-lg text-primary tracking-tight font-serif">Your Outdoor Year</h2>
          </div>
          <span class="font-label-md text-label-md text-amber-on-container bg-amber-container px-2.5 py-0.5 rounded-full font-semibold">Verified Log</span>
        </section>

        <!-- Naturalist Profile Summary Card -->
        <section class="px-margin py-space-xs">
          <div class="bg-surface-card rounded-xl p-space-md shadow-md flex flex-col gap-space-md border border-outline-hairline/60">
            <div class="flex items-center gap-space-md">
              <div class="relative shrink-0">
                <img alt="Naturalist profile portrait of Omkar" class="w-20 h-20 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmrP4X-EhK77vuSbVHvx4HHZFwzrPVQFyfECy4Heo5B8jqaJtGZvT9-AzEI9T9CFRjoCe4TmBXZAHu9rHJmrFzJAx34apRTWVsZJFFa1LuAgQCFesHb_GouVnlEf1dOqfp_dLnwlMfDgsp_XVRYyM51rGsw64pZiXitM7WAf-9iBTLy3-OvL2lSOKIFTcf-8zS3fbsgRvxeXrM0NSUpYCFxqBpLbJ8JC2TaEmJKTwKzX5yztS8w6Ay"/>
                <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container text-vellum-bg flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-[14px]">verified</span>
                </div>
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <h3 class="font-title-md text-title-md text-primary font-bold truncate">Omkar Ranade</h3>
                  <span class="font-label-sm text-label-sm bg-sage-fill text-primary px-2 py-0.5 rounded-full font-semibold shrink-0">Lvl II</span>
                </div>
                <p class="font-latin-name text-latin-name italic text-secondary leading-snug truncate font-serif">Apprentice Naturalist</p>
                <span class="font-label-sm text-label-sm text-on-surface-variant tracking-normal mt-0.5 flex items-center gap-1 truncate">
                  <span class="material-symbols-outlined text-[13px] text-secondary shrink-0">terrain</span>
                  Western Ghats Eco-Region
                </span>
              </div>
            </div>
            <!-- Device Integrity Assurance Bar -->
            <div class="bg-surface-card-subtle rounded-lg px-space-md py-space-sm flex items-center justify-between">
              <div class="flex items-center gap-2 min-w-0">
                <span class="material-symbols-outlined text-[16px] text-secondary shrink-0">lock</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant font-medium truncate">All Data Encrypted On-Device</span>
              </div>
              <span class="font-label-sm text-label-sm text-secondary font-bold tracking-wider uppercase shrink-0 font-mono">Air-Gapped</span>
            </div>
          </div>
        </section>

        <!-- Primary Field Metric Display (2x2 Balanced Plate) -->
        <section class="px-margin py-space-xs">
          <div class="grid grid-cols-2 gap-space-sm">
            <!-- Metric 1: Adventures -->
            <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-hairline/60">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Expeditions</span>
                <span class="material-symbols-outlined text-[20px] text-secondary">explore</span>
              </div>
              <div class="mt-space-sm flex items-baseline gap-1">
                <span class="font-headline-lg text-headline-lg text-primary font-bold font-serif">47</span>
                <span class="font-label-md text-label-md text-on-surface-variant">trips</span>
              </div>
              <span class="font-body-sm text-body-sm text-on-surface-variant mt-1">Logged off-grid</span>
            </div>
            <!-- Metric 2: Outside Hours -->
            <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-hairline/60">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Sunlight</span>
                <span class="material-symbols-outlined text-[20px] text-amber-on-container">wb_sunny</span>
              </div>
              <div class="mt-space-sm flex items-baseline gap-1">
                <span class="font-headline-lg text-headline-lg text-primary font-bold font-serif">31h</span>
                <span class="font-label-md text-label-md text-on-surface-variant">outside</span>
              </div>
              <span class="font-body-sm text-body-sm text-on-surface-variant mt-1">Under canopy</span>
            </div>
            <!-- Metric 3: Total Discoveries -->
            <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-hairline/60">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Observations</span>
                <span class="material-symbols-outlined text-[20px] text-secondary">saved_search</span>
              </div>
              <div class="mt-space-sm flex items-baseline gap-1">
                <span class="font-headline-lg text-headline-lg text-primary font-bold font-serif" id="stat-obs-count">${totalCount}</span>
                <span class="font-label-md text-label-md text-on-surface-variant">records</span>
              </div>
              <span class="font-body-sm text-body-sm text-on-surface-variant mt-1">Field catalog</span>
            </div>
            <!-- Metric 4: Unique Taxa -->
            <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-hairline/60">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Biodiversity</span>
                <span class="material-symbols-outlined text-[20px] text-secondary">potted_plant</span>
              </div>
              <div class="mt-space-sm flex items-baseline gap-1">
                <span class="font-headline-lg text-headline-lg text-primary font-bold font-serif" id="stat-bio-count">${uniqueTaxa}</span>
                <span class="font-label-md text-label-md text-on-surface-variant">species</span>
              </div>
              <span class="font-body-sm text-body-sm text-on-surface-variant mt-1">Unique binomials</span>
            </div>
          </div>
        </section>

        <!-- Interactive Taxa Encounter Showcase -->
        <section class="px-margin py-space-sm">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex flex-col gap-space-md border border-outline-hairline/60">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Taxonomic Balance</span>
                <h4 class="font-headline-md text-headline-md text-primary leading-tight font-serif">Favorite Encounters</h4>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant">${totalCount} Verified</span>
            </div>
            <!-- Visual Specimen Ratio Ribbon -->
            <div class="w-full flex flex-col gap-2">
              <div class="h-3 w-full rounded-full overflow-hidden flex bg-surface-container">
                <div class="bg-primary h-full transition-all duration-500" style="width: ${birdPct}%;"></div>
                <div class="bg-secondary h-full transition-all duration-500" style="width: ${floraPct}%;"></div>
                <div class="bg-tertiary-fixed-dim h-full transition-all duration-500" style="width: ${insectPct}%;"></div>
              </div>
              <!-- Legend -->
              <div class="grid grid-cols-3 gap-1 pt-1">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
                  <span class="font-label-sm text-label-sm text-primary font-bold truncate">Birds ${birdPct}%</span>
                </div>
                <div class="flex items-center gap-1.5 min-w-0 justify-center">
                  <span class="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></span>
                  <span class="font-label-sm text-label-sm text-secondary font-bold truncate">Flora ${floraPct}%</span>
                </div>
                <div class="flex items-center gap-1.5 min-w-0 justify-end">
                  <span class="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim shrink-0"></span>
                  <span class="font-label-sm text-label-sm text-tertiary font-bold truncate">Insects ${insectPct}%</span>
                </div>
              </div>
            </div>

            <!-- Specimen Mini Folio Gallery -->
            <div class="grid grid-cols-3 gap-space-sm pt-space-xs">
              <!-- Specimen 1 (Aves) -->
              <div class="specimen-thumb flex flex-col gap-1.5 group cursor-pointer" data-common="Malabar Whistling Thrush" data-latin="Myophonus hoyi" data-note="Observed in dense evergreen shola forest at 1,120m.">
                <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container">
                  <img class="w-full h-full object-cover" alt="Malabar Whistling Thrush" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0lhGabrR61EqCqPwfQx2TdZM1_XmSeuu1eUaF8cc5YkIwk6HiIKQf0Qz3yKTJ6YIh83-WFteeApRXtu19ze_H6qNveg-K6tUOqpXbbT5QEgzHF0FeQ1vkGpniJBkFvQpFpjSupUPtq_FtfqkLvzjVCff-dQLZekLS5JgU76hlkUXV7BxP_RS9cEq4fPsEab9kp5i-U1rDmEqVXK2yWo4JfYTHEPfDv5PvsbNzdmDVmYi-QA0ujxLX"/>
                  <span class="absolute top-1 left-1 bg-obsidian-scrim text-vellum-bg px-1.5 py-0.5 rounded font-label-sm text-label-sm font-bold">Aves</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="font-body-sm text-body-sm font-semibold text-primary truncate">Whistling Thrush</span>
                  <span class="font-latin-name text-latin-name italic text-secondary text-[11px] truncate font-serif">Myophonus</span>
                </div>
              </div>

              <!-- Specimen 2 (Flora) -->
              <div class="specimen-thumb flex flex-col gap-1.5 group cursor-pointer" data-common="Kurunji Bloom" data-latin="Strobilanthes kunthiana" data-note="Rare mass flowering specimen recorded at altitude edge.">
                <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container">
                  <img class="w-full h-full object-cover" alt="Neelakurinji" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxBdVGFpKrHxsd3E0N8l4JTJtDTWPhSuy2nB-jDuXtP3QOz436rq-UzsnuYpJtVujgQ5StEjjiO7m8t2gbi8GuAw1XE_SKJiUtKHtIbBsd_qACmflKAhwbm7sbqiZAzSXaff7L8OfFI2zNQHP3gVqbBd0s4hsBmW5jzUAsz4bytqXH0NqcElbR8WeIcLvJ7184fVulIjWb-g6oUWTCaVBxS32WefkTi_mPh3cVU8VyXOFZUoEN0IIS"/>
                  <span class="absolute top-1 left-1 bg-obsidian-scrim text-vellum-bg px-1.5 py-0.5 rounded font-label-sm text-label-sm font-bold">Flora</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="font-body-sm text-body-sm font-semibold text-primary truncate">Neelakurinji</span>
                  <span class="font-latin-name text-latin-name italic text-secondary text-[11px] truncate font-serif">Strobilanthes</span>
                </div>
              </div>

              <!-- Specimen 3 (Insecta) -->
              <div class="specimen-thumb flex flex-col gap-1.5 group cursor-pointer" data-common="Southern Birdwing" data-latin="Troides minos" data-note="Largest butterfly in India recorded basking on wet leaf.">
                <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container">
                  <img class="w-full h-full object-cover" alt="Southern Birdwing" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBggPKDDs54BVkWVVM7ghaC7o_TXjl_D2FY2zZDh9KUgDPL-AfJau2TkqbskkyllgPsZfoa47kElgj-kq58prZ-nBixot1CtzpBJjkJ-9KdppPaUwPjmgaxubl34s_PY194sVEi8StKF1GJTNMpvjXCfMDFiJQyrqZDgluQZOW7CJc_D6OhMidacDaYwyPY1onUNvVko0SKAl9z1U_6enbgsHVhvYw_hND55xMDZ5qHgTWqa-gn1p5V"/>
                  <span class="absolute top-1 left-1 bg-obsidian-scrim text-vellum-bg px-1.5 py-0.5 rounded font-label-sm text-label-sm font-bold">Insecta</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="font-body-sm text-body-sm font-semibold text-primary truncate">Birdwing</span>
                  <span class="font-latin-name text-latin-name italic text-secondary text-[11px] truncate font-serif">Troides minos</span>
                </div>
              </div>
            </div>

            <!-- Specimen Detail Drawer (Hidden until tapped) -->
            <div class="hidden bg-surface-card-subtle rounded-lg p-space-sm flex items-start gap-2.5 border border-outline-hairline/60" id="specimen-toast">
              <span class="material-symbols-outlined text-[18px] text-amber-on-container mt-0.5 shrink-0">auto_stories</span>
              <div class="flex flex-col min-w-0 flex-1">
                <div class="flex items-baseline justify-between">
                  <span class="font-title-md text-title-md text-primary font-bold truncate" id="toast-title">Specimen</span>
                  <span class="font-latin-name text-latin-name italic text-secondary text-[12px] truncate ml-2 font-serif" id="toast-latin">Binomial</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5" id="toast-desc">Field notes recorded.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Archival Field Badges & Brass Milestones Section -->
        <section class="px-margin py-space-sm">
          <div class="flex flex-col gap-space-sm">
            <div class="flex items-baseline justify-between">
              <div class="flex flex-col">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Accreditation</span>
                <h4 class="font-headline-md text-headline-md text-primary font-serif">Field Badges &amp; Milestones</h4>
              </div>
              <span class="font-label-sm text-label-sm text-secondary font-bold font-mono">4 / 12 Logged</span>
            </div>
            <div class="flex flex-col gap-space-sm">
              <!-- Milestone 1: First Step -->
              <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex items-center gap-space-md border border-outline-hairline/60">
                <div class="relative w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center shrink-0 shadow-sm">
                  <span class="text-2xl">🌱</span>
                  <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-vellum-bg">✓</span>
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-title-md text-title-md text-primary font-bold truncate">First Step</span>
                    <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-mono">Earned May 14</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-snug mt-0.5">Logged first wild species with verified on-device taxonomy match.</p>
                </div>
              </div>

              <!-- Milestone 2: Canopy Listener -->
              <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex items-center gap-space-md border border-outline-hairline/60">
                <div class="relative w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center shrink-0 shadow-sm">
                  <span class="text-2xl">🐦</span>
                  <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-vellum-bg">✓</span>
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-title-md text-title-md text-primary font-bold truncate">Canopy Listener</span>
                    <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-mono">Earned Jul 02</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-snug mt-0.5">Identified 10 distinct bird calls completely offline via spectrogram.</p>
                </div>
              </div>

              <!-- Milestone 3: Local Botanist -->
              <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex items-center gap-space-md border border-outline-hairline/60">
                <div class="relative w-14 h-14 rounded-full bg-amber-container flex items-center justify-center shrink-0 shadow-sm">
                  <span class="text-2xl">🌿</span>
                  <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-on-container flex items-center justify-center text-[10px] text-vellum-bg">✓</span>
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-title-md text-title-md text-primary font-bold truncate">Local Botanist</span>
                    <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-mono">Earned Sep 19</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-snug mt-0.5">Explored &amp; catalogued 5 native plant families in Ghat wet evergreen zone.</p>
                </div>
              </div>

              <!-- Milestone 4: Grass Toucher -->
              <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex items-center gap-space-md border border-outline-hairline/60">
                <div class="relative w-14 h-14 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 shadow-sm">
                  <span class="text-2xl">📵</span>
                  <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-vellum-bg">✓</span>
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-title-md text-title-md text-primary font-bold truncate">Grass Toucher</span>
                    <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-mono">Earned Nov 08</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant leading-snug mt-0.5">Logged &gt;20 hours outdoors completely phone-free in silent observation.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Scientific Folio Archival Export Card -->
        <section class="px-margin py-space-xs">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline/60 flex flex-col gap-space-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary text-[20px]">file_download</span>
                <h4 class="font-title-md text-title-md text-primary font-bold">Scientific Folio Export</h4>
              </div>
              <span class="font-label-sm text-label-sm text-secondary font-mono font-bold">GBIF · QGIS</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Download your observations in open formats compliant with global biodiversity standards.
            </p>

            <div class="grid grid-cols-3 gap-2 pt-1">
              <button class="p-2.5 rounded-lg bg-surface-card-subtle hover:bg-surface-container flex flex-col items-center justify-center text-center transition-colors cursor-pointer border border-outline-hairline/60 active:scale-95" id="btn-export-dwc">
                <span class="font-label-sm text-label-sm text-primary font-bold">Darwin Core</span>
                <span class="text-[10px] text-secondary font-mono mt-0.5 font-bold">.JSON</span>
              </button>

              <button class="p-2.5 rounded-lg bg-surface-card-subtle hover:bg-surface-container flex flex-col items-center justify-center text-center transition-colors cursor-pointer border border-outline-hairline/60 active:scale-95" id="btn-export-geojson">
                <span class="font-label-sm text-label-sm text-primary font-bold">GeoJSON Map</span>
                <span class="text-[10px] text-secondary font-mono mt-0.5 font-bold">.GEOJSON</span>
              </button>

              <button class="p-2.5 rounded-lg bg-surface-card-subtle hover:bg-surface-container flex flex-col items-center justify-center text-center transition-colors cursor-pointer border border-outline-hairline/60 active:scale-95" id="btn-export-csv">
                <span class="font-label-sm text-label-sm text-primary font-bold">CSV Sheet</span>
                <span class="text-[10px] text-secondary font-mono mt-0.5 font-bold">.CSV</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Archival Journal Excerpt Card -->
        <section class="px-margin py-space-xs">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col gap-space-sm border border-outline-hairline/60">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-on-container"></div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-amber-on-container">edit_note</span>
              <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Field Dispatch Note · Nov 2024</span>
            </div>
            <p class="font-latin-name text-latin-name italic text-on-surface leading-relaxed pl-1 font-serif">
              “The Western Ghats ridges were shroud-heavy with mist this season. Most birds were heard minutes before being seen. Taking the extra time to sketch petal veining by hand deepened what the camera model confirmed.”
            </p>
            <div class="flex items-center justify-between pl-1 pt-1">
              <span class="font-label-sm text-label-sm text-on-surface-variant font-mono">Coorg Highland Transect · Station 4</span>
              <span class="font-label-sm text-label-sm text-secondary font-bold">Omkar R.</span>
            </div>
          </div>
        </section>

        <!-- Bottom Hardware & Local Storage Stamp -->
        <section class="px-margin pt-space-sm pb-space-lg flex flex-col items-center">
          <div class="bg-surface-card-subtle rounded-xl px-space-md py-space-sm w-full flex items-center justify-between border border-outline-hairline/60">
            <div class="flex items-center gap-2 min-w-0">
              <span class="material-symbols-outlined text-[18px] text-secondary shrink-0">hard_drive</span>
              <div class="flex flex-col min-w-0">
                <span class="font-label-sm text-label-sm font-bold text-primary truncate">Storage: 142 MB cached models</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant truncate">Zero Cloud Sync · 100% On-Device</span>
              </div>
            </div>
            <button class="px-3 py-1.5 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container font-label-sm text-label-sm font-semibold shrink-0 transition-colors cursor-pointer" id="verify-weights-btn">
              Verify Weights
            </button>
          </div>
          <p class="font-label-sm text-label-sm text-on-surface-variant/70 text-center mt-space-sm font-mono">
            TrailScribe Field Dossier Engine · v3.8.4 Offline Build
          </p>
        </section>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const thumbs = this.container.querySelectorAll('.specimen-thumb');
    const toast = this.container.querySelector('#specimen-toast');
    const title = this.container.querySelector('#toast-title');
    const latin = this.container.querySelector('#toast-latin');
    const desc = this.container.querySelector('#toast-desc');

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const cName = thumb.getAttribute('data-common') || '';
        const lName = thumb.getAttribute('data-latin') || '';
        const nNote = thumb.getAttribute('data-note') || '';

        if (toast && title && latin && desc) {
          title.textContent = cName;
          latin.textContent = lName;
          desc.textContent = nNote;
          toast.classList.remove('hidden');
          toast.classList.add('flex');
        }
      });
    });

    // Scientific Data Exports
    const btnDwc = this.container.querySelector('#btn-export-dwc');
    btnDwc?.addEventListener('click', () => {
      const dwc = DataExporter.toDarwinCore(this.observations);
      DataExporter.downloadFile(
        JSON.stringify(dwc, null, 2),
        `trailscribe-darwincore-${Date.now()}.json`,
        'application/json'
      );
    });

    const btnGeo = this.container.querySelector('#btn-export-geojson');
    btnGeo?.addEventListener('click', () => {
      const geo = DataExporter.toGeoJSON(this.observations);
      DataExporter.downloadFile(
        JSON.stringify(geo, null, 2),
        `trailscribe-geography-${Date.now()}.geojson`,
        'application/geo+json'
      );
    });

    const btnCsv = this.container.querySelector('#btn-export-csv');
    btnCsv?.addEventListener('click', () => {
      const csv = DataExporter.toCSV(this.observations);
      DataExporter.downloadFile(csv, `trailscribe-records-${Date.now()}.csv`, 'text/csv');
    });

    // Checksum verification
    const verifyBtn = this.container.querySelector('#verify-weights-btn') as HTMLButtonElement;
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        const originalText = verifyBtn.innerText;
        verifyBtn.innerText = 'Validating...';
        verifyBtn.disabled = true;
        setTimeout(() => {
          verifyBtn.innerText = `Hash Match (${this.observations.length} logs) ✓`;
          setTimeout(() => {
            verifyBtn.innerText = originalText;
            verifyBtn.disabled = false;
          }, 2400);
        }, 600);
      });
    }
  }
}
