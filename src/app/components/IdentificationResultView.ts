import { db } from '../../storage/db';
import { FieldEntityParser } from '../../runner/parser';
import { getModelRunner } from '../../runner';
import { ToxicityAnalyzer } from '../../utils/toxicity';

export class IdentificationResultView {
  private container: HTMLElement;
  private onAddToJournal: () => void;
  private specimenData?: {
    id?: string;
    commonName?: string;
    scientificName?: string;
    photoUrl?: string;
    confidence?: number;
    locationText?: string;
    coordsText?: string;
    timeText?: string;
    fieldNotes?: string;
    habitat?: string;
    kingdomOrGroup?: string;
    abundanceCount?: number;
  };

  constructor(
    container: HTMLElement,
    callbacks: {
      onAddToJournal: () => void;
    },
    specimenData?: {
      id?: string;
      commonName?: string;
      scientificName?: string;
      photoUrl?: string;
      confidence?: number;
      locationText?: string;
      coordsText?: string;
      timeText?: string;
      fieldNotes?: string;
      habitat?: string;
      kingdomOrGroup?: string;
      abundanceCount?: number;
    }
  ) {
    this.container = container;
    this.onAddToJournal = callbacks.onAddToJournal;
    this.specimenData = specimenData;
  }

  render(): void {
    const commonName = this.specimenData?.commonName || 'Indian Palm Squirrel';
    const scientificName = this.specimenData?.scientificName || 'Funambulus palmarum';
    const photoUrl = this.specimenData?.photoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUq24kjNUYNTxx9ant7TAfN6xjpb3UCN8Pz0n8SGwbECI6fi2QCTTf08Rw5Ge9umcFh8_DgRLspfVvTWRU6X_rfLL3o3ytL4gYWdOZ2aLxiUZZHIenRLjPdmJ0C82-P3XnQYfBHFCKX1IhZo-_yHk31R-G4e4Nc6SG-P_zyj1caoetLM0zRplIe0WFMlQ_Y4clQKixljMHS-onwfNLuqVvwB5h-wenFx2oD6Y3yv3MjP-lcuXDzYKq';
    const confidence = this.specimenData?.confidence ?? 94;
    const coordsText = this.specimenData?.coordsText || '19.0438° N, 73.0674° E';
    const timeText = this.specimenData?.timeText || '08:42 AM';
    const locationText = this.specimenData?.locationText || 'Kharghar Hills';

    // Compute forager safety and toxicity profile
    const toxicity = ToxicityAnalyzer.evaluate(commonName, scientificName, this.specimenData?.kingdomOrGroup);

    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-28 view-enter">
        <!-- Specimen Plate Photo Presentation -->
        <section class="px-margin pt-space-sm">
          <div class="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md bg-surface-container">
            <img class="w-full h-full object-cover select-none" alt="${commonName}" src="${photoUrl}"/>
            <!-- Top-right Geolocation Pill -->
            <div class="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-scrim backdrop-blur-md text-vellum-bg shadow-sm">
              <span class="material-symbols-outlined text-tertiary-fixed-dim text-[15px]">location_on</span>
              <span class="font-label-sm text-label-sm tracking-wide font-medium font-mono">${coordsText}</span>
            </div>
            <!-- Bottom-left High Confidence Pill -->
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-scrim backdrop-blur-md text-vellum-bg shadow-sm">
              <span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim inline-block animate-pulse"></span>
              <span class="font-label-sm text-label-sm tracking-wider uppercase font-bold text-vellum-bg">${confidence}% CONFIDENCE</span>
            </div>
            <!-- Sound Wave Overlay Trigger -->
            <button aria-label="Play acoustic audio reference" class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-obsidian-scrim backdrop-blur-md text-vellum-bg flex items-center justify-center active:scale-95 transition-transform cursor-pointer" id="audio-sample-btn">
              <span class="material-symbols-outlined text-[20px] text-tertiary-fixed-dim" id="audio-icon">volume_up</span>
            </button>
          </div>
        </section>

        <!-- Specimen Identity Header -->
        <section class="px-margin pt-3">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[9.5px] uppercase tracking-wider text-amber-on-container font-bold">
              SPECIMEN RECORDED • LOCAL VISION MODEL
            </span>
            <span class="text-[10px] text-secondary font-medium tracking-tight font-mono">ID #8492-IN</span>
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-primary tracking-tight leading-tight font-serif">
            ${commonName}
          </h2>
          <p class="text-xs italic text-secondary pt-0.5 pb-2 font-serif">
            ${scientificName}
          </p>
          <!-- Taxonomy and Conservation Status Chips -->
          <div class="flex flex-wrap gap-1.5 pt-0.5 pb-2">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sage-fill text-primary text-[11px] font-semibold">
              <span class="material-symbols-outlined text-[13px]">pets</span>
              Fauna
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-sage-fill text-primary text-[11px] font-semibold">
              Order Rodentia
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-sage-fill text-primary text-[11px] font-semibold">
              Native
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sage-fill text-primary text-[11px] font-semibold">
              <span class="material-symbols-outlined text-[13px] text-secondary">verified_user</span>
              Least Concern
            </span>
          </div>
          <!-- Brief Scientific Profile -->
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Common around urban parks and gardens. Known for three bold dorsal stripes and a soft, bushy tail.
          </p>
        </section>

        <!-- Toxicity / Forager Safety Hazard Banner (Requested by Marcus Thorne) -->
        ${
          toxicity.isToxic
            ? `
        <section class="px-margin pt-space-sm" id="toxicity-alert-section">
          <div class="relative rounded-xl p-space-md shadow-md overflow-hidden flex flex-col gap-2.5 border-2 ${
            toxicity.severity === 'DEADLY'
              ? 'bg-red-950/95 text-red-100 border-red-500 animate-pulse'
              : toxicity.severity === 'POISONOUS'
              ? 'bg-amber-950/95 text-amber-100 border-amber-500'
              : 'bg-yellow-950/95 text-yellow-100 border-yellow-600'
          }">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-[22px]">${toxicity.severity === 'DEADLY' ? '☠️' : '⚠️'}</span>
                <span class="font-label-sm text-[11px] uppercase tracking-wider font-bold">${toxicity.title}</span>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-bold tracking-widest uppercase bg-black/50 border border-white/20">
                ${toxicity.badgeLabel}
              </span>
            </div>
            
            <p class="font-body-sm text-[13px] leading-snug font-medium text-white/95">
              ${toxicity.warningSummary}
            </p>

            <!-- Prominent Lookalike Warning Box -->
            <div class="bg-red-950/60 rounded-lg p-2.5 flex flex-col gap-1 text-[11.5px] border border-red-500/40">
              <div class="flex items-center gap-1.5 text-red-300 font-mono font-bold text-[10px] uppercase">
                <span class="material-symbols-outlined text-[14px]">compare_arrows</span>
                <span>CRITICAL LOOKALIKE DANGER:</span>
              </div>
              <p class="text-white/90 leading-tight">
                ${toxicity.lookalikeRisk}
              </p>
            </div>

            <!-- Toxin Breakdown & Field Safety -->
            <div class="bg-black/40 rounded-lg p-2.5 flex flex-col gap-1.5 text-[11.5px] border border-white/10 mt-0.5">
              ${
                toxicity.toxinTypes.length > 0
                  ? `
                <div class="flex items-baseline gap-1.5">
                  <span class="text-white/60 uppercase font-mono text-[10px] shrink-0 font-bold">Identified Toxins:</span>
                  <span class="text-amber-200 font-mono font-semibold">${toxicity.toxinTypes.join(', ')}</span>
                </div>
              `
                  : ''
              }
              <div class="flex items-baseline gap-1.5">
                <span class="text-white/60 uppercase font-mono text-[10px] shrink-0 font-bold">Clinical Symptoms:</span>
                <span class="text-white/80">${toxicity.symptoms}</span>
              </div>
              <div class="flex items-baseline gap-1.5 pt-1 border-t border-white/10">
                <span class="text-red-300 font-bold uppercase font-mono text-[10px] shrink-0">Field Safety Rule:</span>
                <span class="text-red-200 font-semibold">${toxicity.safetyGuidance}</span>
              </div>
            </div>

            <!-- Emergency Protocol Pill -->
            <div class="flex items-center justify-between text-[10px] font-mono text-white/70 pt-0.5">
              <span>Wilderness Poison Control: 1-800-222-1222</span>
              <span class="text-amber-300 font-bold">NEVER INGEST</span>
            </div>
          </div>
        </section>
        `
            : `
        <!-- Reassuring Non-Toxic Botanical/Fauna Badge -->
        <section class="px-margin pt-space-xs">
          <div class="bg-surface-card rounded-xl p-2.5 px-3 shadow-xs border border-emerald-600/30 flex items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-2 text-emerald-800 font-medium">
              <span class="material-symbols-outlined text-[17px] text-emerald-600">verified</span>
              <span>No Acute Contact or Ingestion Toxins Recorded</span>
            </div>
            <span class="text-[9.5px] font-mono uppercase text-secondary font-bold bg-surface-card-subtle px-2 py-0.5 rounded-full border border-outline-hairline/60">
              Forager Safe
            </span>
          </div>
        </section>
        `
        }

        <!-- Editorial Did You Know Highlight -->
        <section class="px-margin pt-space-md">
          <div class="relative bg-surface-card rounded-xl p-space-md shadow-sm overflow-hidden flex flex-col gap-1.5 border border-outline-hairline/60">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-tertiary-fixed-dim"></div>
            <div class="flex items-center gap-1.5 text-amber-on-container">
              <span class="material-symbols-outlined text-[18px]">lightbulb</span>
              <span class="font-label-sm text-label-sm uppercase tracking-wider font-bold">DID YOU KNOW?</span>
            </div>
            <p class="font-body-md text-body-md text-on-surface leading-relaxed pl-1">
              They communicate using high-pitched bird-like alarm calls when hawks or domestic cats approach, frequently confusing amateur birdwatchers.
            </p>
          </div>
        </section>

        <!-- Naturalist Insights by Gemma 2:2B (Interactive Query Component) -->
        <section class="px-margin pt-space-md">
          <div class="relative bg-surface-card rounded-xl p-space-md shadow-sm border border-secondary/40 overflow-hidden flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                  NATURALIST INSIGHTS · GEMMA 2:2B
                </span>
              </div>
              <button id="query-gemma-btn" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-primary hover:bg-surface-container active:scale-95 transition-all text-xs font-semibold cursor-pointer border border-outline-hairline/60">
                <span class="material-symbols-outlined text-[14px] text-tertiary-fixed-dim" id="query-gemma-icon">psychology</span>
                <span id="query-gemma-label">Ask Gemma 2B</span>
              </button>
            </div>

            <div id="gemma-insights-content" class="flex flex-col gap-2.5 text-body-sm text-on-surface-variant">
              <!-- Native Status Card -->
              <div class="bg-surface-container-low rounded-lg p-2.5 border-l-2 border-primary">
                <div class="flex items-center gap-1.5 text-primary font-semibold text-xs uppercase tracking-wide">
                  <span class="material-symbols-outlined text-[14px]">nature</span>
                  <span>Native & Biogeographic Status</span>
                </div>
                <p class="text-xs text-on-surface mt-1" id="gemma-native-status">
                  Native to peninsular India, Sri Lanka, and Western Ghats bio-corridors. Frequently observed in deciduous canopies and urban flora.
                </p>
              </div>

              <!-- Foraging & Diet Notes -->
              <div class="bg-surface-container-low rounded-lg p-2.5 border-l-2 border-amber-on-container">
                <div class="flex items-center gap-1.5 text-amber-on-container font-semibold text-xs uppercase tracking-wide">
                  <span class="material-symbols-outlined text-[14px]">restaurant</span>
                  <span>Foraging & Diet Ecology</span>
                </div>
                <p class="text-xs text-on-surface mt-1" id="gemma-foraging-notes">
                  Active diurnal omnivore. Feeds on seasonal berries, tree seeds, tender buds, nectar, and opportunistically small invertebrates.
                </p>
              </div>

              <!-- Seasonal & Phenological Indicators -->
              <div class="bg-surface-container-low rounded-lg p-2.5 border-l-2 border-tertiary-fixed-dim">
                <div class="flex items-center gap-1.5 text-secondary font-semibold text-xs uppercase tracking-wide">
                  <span class="material-symbols-outlined text-[14px]">calendar_month</span>
                  <span>Seasonal Phenology</span>
                </div>
                <p class="text-xs text-on-surface mt-1" id="gemma-seasonal-indicators">
                  Breeds year-round with peak reproductive activity during post-monsoon foliage flushes. Vocal activity peaks at dawn.
                </p>
              </div>
            </div>

            <!-- On-device Inference Footnote -->
            <div class="flex items-center justify-between text-[10px] font-mono text-outline pt-1 border-t border-outline-hairline/40">
              <span id="gemma-runner-mode">Engine: Gemma 2:2B (Ollama Local API / Fallback)</span>
              <span class="text-emerald-600 font-semibold">100% On-Device & Offline</span>
            </div>
          </div>
        </section>

        <!-- Discovery Ledger Card -->
        <section class="px-margin pt-space-md">
          <div class="bg-surface-card-subtle rounded-xl p-space-md flex flex-col gap-space-sm shadow-sm border border-outline-hairline/60">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary">
                <span class="material-symbols-outlined text-[20px] text-secondary">history_edu</span>
                <span class="font-label-sm text-label-sm uppercase font-bold tracking-wider">YOUR DISCOVERY LOG</span>
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Logged Offline</span>
            </div>
            <div class="grid grid-cols-3 gap-2 pt-1 text-center">
              <div class="bg-surface-container rounded-lg p-2.5 flex flex-col items-center justify-center">
                <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Time</span>
                <span class="font-title-md text-title-md text-primary font-bold">${timeText}</span>
              </div>
              <div class="bg-surface-container rounded-lg p-2.5 flex flex-col items-center justify-center">
                <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Site</span>
                <span class="font-title-md text-title-md text-primary font-bold truncate w-full">${locationText}</span>
              </div>
              <div class="bg-surface-container rounded-lg p-2.5 flex flex-col items-center justify-center">
                <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Trek</span>
                <span class="font-title-md text-title-md text-primary font-bold">Exp #12</span>
              </div>
            </div>
            <!-- Quick Field Note Toggler -->
            <div class="pt-1">
              <button class="w-full flex items-center justify-between py-2 text-left text-on-surface-variant hover:text-primary transition-colors cursor-pointer" id="add-note-toggle">
                <span class="font-body-sm text-body-sm flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">edit_note</span>
                  Attach field habitat note or audio tag...
                </span>
                <span class="material-symbols-outlined text-[18px] transition-transform" id="note-chevron">expand_more</span>
              </button>
              <div class="hidden pt-2 flex flex-col gap-1.5" id="note-input-container">
                <textarea id="field-note-input" class="w-full bg-surface-container text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-lg p-3 outline-none resize-none border border-outline-hairline/80" placeholder="Observed feeding on wild figs near damp rock cleft..." rows="2">${this.specimenData?.fieldNotes || ''}</textarea>
                <div id="note-entity-chips" class="flex flex-wrap gap-1.5 empty:hidden"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Interactive Morphometric Spark Indicator -->
        <section class="px-margin pt-space-md">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-md border border-outline-hairline/60">
            <div class="flex flex-col min-w-0">
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Seasonal Abundance</span>
              <span class="font-title-md text-title-md text-primary font-semibold">Peak Monsoon Activity</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">Documented 14 times this season along Western Ghats foothills.</span>
            </div>
            <!-- Mini Sparkline inline SVG -->
            <div class="shrink-0 w-24 h-12 flex items-center justify-center">
              <svg class="w-full h-full text-secondary stroke-current fill-none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewbox="0 0 100 40">
                <path d="M 5 35 Q 25 32 40 18 T 75 10 T 95 6"></path>
                <circle class="fill-tertiary-fixed-dim stroke-primary" cx="95" cy="6" r="3.5" stroke-width="1.5"></circle>
              </svg>
            </div>
          </div>
        </section>

        <!-- Action Stack -->
        <section class="px-margin pt-space-lg flex flex-col gap-3">
          <!-- Primary Forest Green Button -->
          <button class="w-full h-12 rounded-lg bg-primary-container text-vellum-bg font-title-md text-title-md flex items-center justify-center gap-2 active:bg-secondary transition-all shadow-md active:scale-[0.99] cursor-pointer ambient-glow" id="save-journal-btn">
            <span class="material-symbols-outlined text-[20px]" id="journal-icon">bookmark_add</span>
            <span id="journal-label">+ ADD TO FIELD JOURNAL</span>
          </button>
          <!-- Secondary Navigation Action -->
          <button class="w-full h-12 rounded-lg bg-surface-card text-primary font-title-md text-title-md flex items-center justify-center gap-2 shadow-sm active:bg-surface-container transition-all cursor-pointer border border-outline-hairline/60" id="explore-taxonomy-btn">
            <span class="material-symbols-outlined text-[20px] text-secondary">account_tree</span>
            <span>EXPLORE SPECIES TAXONOMY</span>
          </button>
        </section>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Note expander
    const noteToggle = this.container.querySelector('#add-note-toggle');
    const noteContainer = this.container.querySelector('#note-input-container');
    const noteChevron = this.container.querySelector('#note-chevron');
    const noteInput = this.container.querySelector('#field-note-input') as HTMLTextAreaElement | null;
    const chipsContainer = this.container.querySelector('#note-entity-chips');

    const updateEntityChips = () => {
      if (!noteInput || !chipsContainer) return;
      const text = noteInput.value.trim();
      if (!text) {
        chipsContainer.innerHTML = '';
        return;
      }
      const parsed = FieldEntityParser.parse(text);
      const chips: string[] = [];
      if (parsed.abundanceCount && parsed.abundanceCount > 1) {
        chips.push(`<span class="px-2 py-0.5 rounded-full bg-secondary-container text-primary text-[11px] font-semibold">Count: ${parsed.abundanceCount}</span>`);
      }
      if (parsed.substrate) {
        chips.push(`<span class="px-2 py-0.5 rounded-full bg-amber-container text-amber-on-container text-[11px] font-semibold">Substrate: ${parsed.substrate}</span>`);
      }
      if (parsed.habitat) {
        chips.push(`<span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary text-[11px] font-semibold">Habitat: ${parsed.habitat}</span>`);
      }
      if (parsed.speciesCandidates.length > 0 && parsed.speciesCandidates[0] !== this.specimenData?.commonName) {
        chips.push(`<span class="px-2 py-0.5 rounded-full bg-surface-container-high text-primary text-[11px] font-semibold">Affinity: ${parsed.speciesCandidates[0]}</span>`);
      }
      chipsContainer.innerHTML = chips.join('');
    };

    if (noteInput) {
      noteInput.addEventListener('input', updateEntityChips);
      if (noteInput.value) updateEntityChips();
    }

    if (noteToggle && noteContainer && noteChevron) {
      noteToggle.addEventListener('click', () => {
        const isHidden = noteContainer.classList.contains('hidden');
        if (isHidden) {
          noteContainer.classList.remove('hidden');
          noteChevron.classList.add('rotate-180');
          noteInput?.focus();
        } else {
          noteContainer.classList.add('hidden');
          noteChevron.classList.remove('rotate-180');
        }
      });
    }

    // Save button micro-interaction
    const saveBtn = this.container.querySelector('#save-journal-btn');
    const journalIcon = this.container.querySelector('#journal-icon');
    const journalLabel = this.container.querySelector('#journal-label');

    if (saveBtn && journalIcon && journalLabel) {
      saveBtn.addEventListener('click', async () => {
        journalIcon.textContent = 'check_circle';
        journalIcon.classList.add('text-tertiary-fixed-dim');
        journalLabel.textContent = 'SAVED TO JOURNAL (FOLIO #12)';
        saveBtn.classList.remove('bg-primary-container');
        saveBtn.classList.add('bg-secondary');

        try {
          if (this.specimenData?.id) {
            const updates: Record<string, unknown> = { synced: true };
            if (noteInput && noteInput.value.trim()) {
              const text = noteInput.value.trim();
              const parsed = FieldEntityParser.parse(text);
              updates.fieldNotes = text;
              if (parsed.abundanceCount) updates.abundanceCount = parsed.abundanceCount;
              if (parsed.substrate) updates.substrate = parsed.substrate;
              if (parsed.habitat) updates.habitat = parsed.habitat;
            }
            await db.updateObservation(this.specimenData.id, updates);
          }
        } catch (e) {
          console.warn('DB update notice:', e);
        }

        setTimeout(() => {
          journalIcon.textContent = 'bookmark_added';
          journalLabel.textContent = 'SAVED IN LOCAL ARCHIVE';
          setTimeout(() => {
            this.onAddToJournal();
          }, 600);
        }, 1200);
      });
    }

    // Audio sample button
    const audioBtn = this.container.querySelector('#audio-sample-btn');
    const audioIcon = this.container.querySelector('#audio-icon');

    if (audioBtn && audioIcon) {
      let isPlaying = false;
      audioBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
          audioIcon.textContent = 'graphic_eq';
          audioIcon.classList.add('animate-pulse');
          this.playSynthesizedChirp();
          setTimeout(() => {
            isPlaying = false;
            audioIcon.textContent = 'volume_up';
            audioIcon.classList.remove('animate-pulse');
          }, 2400);
        } else {
          audioIcon.textContent = 'volume_up';
          audioIcon.classList.remove('animate-pulse');
        }
      });
    }

    // Taxonomy button
    const taxonomyBtn = this.container.querySelector('#explore-taxonomy-btn');
    taxonomyBtn?.addEventListener('click', () => {
      this.onAddToJournal();
    });

    // Gemma 2:2B Naturalist Insights Query
    const queryGemmaBtn = this.container.querySelector('#query-gemma-btn');
    const queryGemmaIcon = this.container.querySelector('#query-gemma-icon');
    const queryGemmaLabel = this.container.querySelector('#query-gemma-label');
    const nativeStatusEl = this.container.querySelector('#gemma-native-status');
    const foragingNotesEl = this.container.querySelector('#gemma-foraging-notes');
    const seasonalIndicatorsEl = this.container.querySelector('#gemma-seasonal-indicators');
    const runnerModeEl = this.container.querySelector('#gemma-runner-mode');

    const runGemmaQuery = async () => {
      if (!queryGemmaBtn || !queryGemmaLabel || !queryGemmaIcon) return;
      queryGemmaLabel.textContent = 'Reasoning...';
      queryGemmaIcon.classList.add('animate-spin');
      queryGemmaBtn.setAttribute('disabled', 'true');

      const runner = getModelRunner();
      if (runnerModeEl) {
        runnerModeEl.textContent = `Engine: ${runner.name}`;
      }

      const cName = this.specimenData?.commonName || 'Indian Palm Squirrel';
      const sName = this.specimenData?.scientificName || 'Funambulus palmarum';

      try {
        if (runner.queryNaturalistContext) {
          const res = await runner.queryNaturalistContext(cName, sName);
          if (runnerModeEl && res.modelUsed) runnerModeEl.textContent = `Engine: ${res.modelUsed}`;
          if (nativeStatusEl && res.nativeStatus) nativeStatusEl.textContent = res.nativeStatus;
          if (foragingNotesEl && res.foragingNotes) foragingNotesEl.textContent = res.foragingNotes;
          if (seasonalIndicatorsEl && res.seasonalIndicators) seasonalIndicatorsEl.textContent = res.seasonalIndicators;
        } else {
          const prompt = `Taxa: ${cName} (${sName}). Provide native status, diet, and seasonal indicators.`;
          const entities = await runner.extractFieldEntities(prompt);
          if (nativeStatusEl) nativeStatusEl.textContent = `Documented in regional ecosystem (${entities.kingdomOrGroup || 'Plantae/Fauna'}).`;
          if (foragingNotesEl && entities.substrate) foragingNotesEl.textContent = `Frequently observed on substrate: ${entities.substrate}.`;
          if (seasonalIndicatorsEl && entities.habitat) seasonalIndicatorsEl.textContent = `Peak activity associated with habitat: ${entities.habitat}.`;
        }
      } catch (err) {
        console.warn('Gemma query notice:', err);
      } finally {
        queryGemmaLabel.textContent = 'Refresh Insights';
        queryGemmaIcon.classList.remove('animate-spin');
        queryGemmaBtn.removeAttribute('disabled');
      }
    };

    queryGemmaBtn?.addEventListener('click', () => {
      runGemmaQuery();
    });
  }

  private playSynthesizedChirp(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.32);
    } catch (e) {
      console.warn('AudioContext unavailable:', e);
    }
  }
}
