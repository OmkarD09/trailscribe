export class IdentificationResultView {
  private container: HTMLElement;
  private onAddToJournal: () => void;
  private specimenData?: {
    commonName?: string;
    scientificName?: string;
    photoUrl?: string;
    confidence?: number;
    locationText?: string;
    coordsText?: string;
    timeText?: string;
  };

  constructor(
    container: HTMLElement,
    callbacks: {
      onAddToJournal: () => void;
    },
    specimenData?: {
      commonName?: string;
      scientificName?: string;
      photoUrl?: string;
      confidence?: number;
      locationText?: string;
      coordsText?: string;
      timeText?: string;
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

    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-12 view-enter">
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
        <section class="px-margin pt-space-md">
          <div class="flex items-center justify-between gap-space-sm mb-1.5">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-amber-on-container font-bold">
              SPECIMEN RECORDED • LOCAL ON-DEVICE MODEL
            </span>
            <span class="font-label-sm text-label-sm text-secondary font-medium tracking-tight font-mono">ID #8492-IN</span>
          </div>
          <h2 class="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight leading-tight font-serif">
            ${commonName}
          </h2>
          <p class="font-latin-name text-latin-name italic text-secondary pt-0.5 pb-space-sm font-serif">
            ${scientificName}
          </p>
          <!-- Taxonomy and Conservation Status Chips -->
          <div class="flex flex-wrap gap-2 pt-1 pb-space-sm">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
              <span class="material-symbols-outlined text-[14px]">pets</span>
              Fauna
            </span>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
              Order Rodentia
            </span>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
              Native
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
              <span class="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
              Least Concern
            </span>
          </div>
          <!-- Brief Scientific Profile -->
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Common around urban parks and gardens. Known for three bold dorsal stripes and a soft, bushy tail.
          </p>
        </section>

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
              <div class="hidden pt-2" id="note-input-container">
                <textarea class="w-full bg-surface-container text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-lg p-3 outline-none resize-none border border-outline-hairline/80" placeholder="Observed feeding on wild figs near damp rock cleft..." rows="2"></textarea>
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
          <button class="w-full h-12 rounded-lg bg-primary-container text-vellum-bg font-title-md text-title-md flex items-center justify-center gap-2 active:bg-secondary transition-all shadow-md active:scale-[0.99] cursor-pointer" id="save-journal-btn">
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

    if (noteToggle && noteContainer && noteChevron) {
      noteToggle.addEventListener('click', () => {
        const isHidden = noteContainer.classList.contains('hidden');
        if (isHidden) {
          noteContainer.classList.remove('hidden');
          noteChevron.classList.add('rotate-180');
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
      saveBtn.addEventListener('click', () => {
        journalIcon.textContent = 'check_circle';
        journalIcon.classList.add('text-tertiary-fixed-dim');
        journalLabel.textContent = 'SAVED TO JOURNAL (FOLIO #12)';
        saveBtn.classList.remove('bg-primary-container');
        saveBtn.classList.add('bg-secondary');

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
