import { db } from '../../storage/db';
import { DataExporter } from '../../storage/exporter';
import type { FieldObservation } from '../../storage/types';

export class ObservationDetailView {
  private container: HTMLElement;
  private observation: FieldObservation;
  private onBack: () => void;
  private audioPlayer: HTMLAudioElement | null = null;
  private isPlayingAudio = false;

  constructor(container: HTMLElement, observation: FieldObservation, onBack: () => void) {
    this.container = container;
    this.observation = observation;
    this.onBack = onBack;
  }

  render(): void {
    const obs = this.observation;
    let photoSrc = obs.photoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUq24kjNUYNTxx9ant7TAfN6xjpb3UCN8Pz0n8SGwbECI6fi2QCTTf08Rw5Ge9umcFh8_DgRLspfVvTWRU6X_rfLL3o3ytL4gYWdOZ2aLxiUZZHIenRLjPdmJ0C82-P3XnQYfBHFCKX1IhZo-_yHk31R-G4e4Nc6SG-P_zyj1caoetLM0zRplIe0WFMlQ_Y4clQKixljMHS-onwfNLuqVvwB5h-wenFx2oD6Y3yv3MjP-lcuXDzYKq';
    if (obs.photoBlob) {
      photoSrc = URL.createObjectURL(obs.photoBlob);
    }

    const confidence = Math.round((obs.confidenceScore ?? 0.94) * 100);
    const coordsStr = obs.coordinates
      ? `${obs.coordinates.latitude.toFixed(4)}° N, ${obs.coordinates.longitude.toFixed(4)}° E`
      : '19.0438° N, 73.0674° E';
    const timeStr = obs.readableDate.includes(',') ? obs.readableDate.split(',')[1].trim() : obs.readableDate;

    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-28">
        <!-- Specimen Plate Photo Presentation -->
        <section class="px-margin pt-space-sm">
          <div class="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md bg-surface-container border border-outline-hairline">
            <img class="w-full h-full object-cover select-none" src="${photoSrc}" alt="${obs.commonName || 'Specimen'}" />
            
            <!-- Top-right Geolocation Pill -->
            <div class="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-scrim backdrop-blur-md text-vellum-bg shadow-sm">
              <span class="material-symbols-outlined text-tertiary-fixed-dim text-[15px]">location_on</span>
              <span class="font-label-sm text-label-sm tracking-wide font-medium">${coordsStr}</span>
            </div>

            <!-- Bottom-left High Confidence Pill -->
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-scrim backdrop-blur-md text-vellum-bg shadow-sm">
              <span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim inline-block animate-pulse"></span>
              <span class="font-label-sm text-label-sm tracking-wider uppercase font-bold text-vellum-bg">${confidence}% CONFIDENCE</span>
            </div>

            <!-- Audio Sample Trigger -->
            ${obs.audioBlob ? `
              <button aria-label="Play acoustic audio reference" class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-obsidian-scrim backdrop-blur-md text-vellum-bg flex items-center justify-center active:scale-95 transition-transform cursor-pointer" id="btn-audio-sample">
                <span class="material-symbols-outlined text-[20px] text-tertiary-fixed-dim" id="detail-audio-icon">volume_up</span>
              </button>
            ` : ''}
          </div>
        </section>

        <!-- Specimen Identity Header -->
        <section class="px-margin pt-space-md">
          <div class="flex items-center justify-between gap-space-sm mb-1.5">
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-amber-on-container font-bold">
              SPECIMEN RECORDED • LOCAL ON-DEVICE MODEL
            </span>
            <span class="font-label-sm text-label-sm text-secondary font-medium tracking-tight">ID #${obs.id.slice(0, 6)}</span>
          </div>
          <h2 class="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight leading-tight font-serif">
            ${obs.commonName || obs.speciesCandidates[0] || 'Unidentified'}
          </h2>
          <p class="font-latin-name text-latin-name italic text-secondary pt-0.5 pb-space-sm">
            ${obs.scientificName || 'Binomial classification in progress'}
          </p>

          <!-- Taxonomy and Conservation Status Chips -->
          <div class="flex flex-wrap gap-2 pt-1 pb-space-sm">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
              <span class="material-symbols-outlined text-[14px]">pets</span>
              ${obs.kingdomOrGroup || 'Fauna'}
            </span>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
              Order Verified
            </span>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
              Native Species
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
              <span class="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
              Least Concern
            </span>
          </div>

          <!-- Brief Scientific Profile -->
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            ${obs.rawTranscript || 'Observed in natural trail habitat under clear conditions. On-device neural classifier matched morphological features with high precision.'}
          </p>
        </section>

        <!-- Editorial Did You Know Highlight -->
        <section class="px-margin pt-space-md">
          <div class="relative bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline overflow-hidden flex flex-col gap-1.5">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-tertiary-fixed-dim"></div>
            <div class="flex items-center gap-1.5 text-amber-on-container">
              <span class="material-symbols-outlined text-[18px]">lightbulb</span>
              <span class="font-label-sm text-label-sm uppercase tracking-wider font-bold">DID YOU KNOW?</span>
            </div>
            <p class="font-body-md text-body-md text-on-surface leading-relaxed pl-1">
              ${obs.fieldNotes || 'Naturalists utilize high-frequency bioacoustics and dorsal pattern recognition to census population distributions without disturbing ground nests.'}
            </p>
          </div>
        </section>

        <!-- Discovery Ledger Card -->
        <section class="px-margin pt-space-md">
          <div class="bg-surface-card-subtle rounded-xl p-space-md flex flex-col gap-space-sm shadow-sm border border-outline-hairline">
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
                <span class="font-title-md text-title-md text-primary font-bold">${timeStr}</span>
              </div>
              <div class="bg-surface-container rounded-lg p-2.5 flex flex-col items-center justify-center">
                <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Habitat</span>
                <span class="font-title-md text-title-md text-primary font-bold truncate w-full">${obs.habitat || 'Woodland'}</span>
              </div>
              <div class="bg-surface-container rounded-lg p-2.5 flex flex-col items-center justify-center">
                <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Count</span>
                <span class="font-title-md text-title-md text-primary font-bold">x${obs.abundanceCount ?? 1}</span>
              </div>
            </div>

            <!-- Notes Section -->
            <div class="pt-1">
              <div class="p-2.5 bg-surface-container rounded-lg">
                <span class="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Field Note</span>
                <p class="font-body-sm text-body-sm text-on-surface mt-1">
                  ${obs.fieldNotes || obs.rawTranscript || 'Direct sensory observation logged in field ledger.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Seasonal Abundance Indicator -->
        <section class="px-margin pt-space-md">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline flex items-center justify-between gap-space-md">
            <div class="flex flex-col min-w-0">
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Seasonal Abundance</span>
              <span class="font-title-md text-title-md text-primary font-semibold">Peak Monsoon Activity</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">Documented along Western Ghats foothills corridors.</span>
            </div>
            <div class="shrink-0 w-24 h-12 flex items-center justify-center">
              <svg class="w-full h-full text-secondary stroke-current fill-none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 100 40">
                <path d="M 5 35 Q 25 32 40 18 T 75 10 T 95 6"></path>
                <circle class="fill-tertiary-fixed-dim stroke-primary" cx="95" cy="6" r="3.5" stroke-width="1.5"></circle>
              </svg>
            </div>
          </div>
        </section>

        <!-- Action Stack -->
        <section class="px-margin pt-space-lg flex flex-col gap-3">
          <button class="w-full h-12 rounded-lg bg-primary-container text-vellum-bg font-title-md text-title-md flex items-center justify-center gap-2 active:bg-secondary transition-all shadow-md active:scale-[0.99] cursor-pointer" id="btn-export-single-dwc">
            <span class="material-symbols-outlined text-[20px]">share</span>
            <span>EXPORT DARWIN CORE RECORD</span>
          </button>

          <button class="w-full h-12 rounded-lg bg-surface-card text-error-red font-title-md text-title-md flex items-center justify-center gap-2 border border-error-red/20 active:bg-surface-card-subtle transition-all cursor-pointer" id="btn-delete-observation">
            <span class="material-symbols-outlined text-[20px]">delete_outline</span>
            <span>DELETE SPECIMEN</span>
          </button>

          <button class="w-full py-2 text-center text-on-surface-variant hover:text-primary transition-colors text-body-sm cursor-pointer" id="btn-back-to-journal">
            ← Return to Field Journal
          </button>
        </section>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const backBtn = document.getElementById('btn-back-to-journal');
    backBtn?.addEventListener('click', () => {
      this.cleanupAudio();
      this.onBack();
    });

    const exportBtn = document.getElementById('btn-export-single-dwc');
    exportBtn?.addEventListener('click', () => {
      const dwc = DataExporter.toDarwinCore([this.observation]);
      DataExporter.downloadFile(
        JSON.stringify(dwc, null, 2),
        `trailscribe-${this.observation.id}.json`,
        'application/json'
      );
    });

    const deleteBtn = document.getElementById('btn-delete-observation');
    deleteBtn?.addEventListener('click', async () => {
      if (confirm(`Delete specimen "${this.observation.commonName || 'Unnamed'}" from on-device catalog?`)) {
        await db.deleteObservation(this.observation.id);
        this.cleanupAudio();
        this.onBack();
      }
    });

    // Audio sample playback
    const audioBtn = document.getElementById('btn-audio-sample');
    audioBtn?.addEventListener('click', () => {
      if (!this.observation.audioBlob) return;

      if (!this.audioPlayer) {
        const url = URL.createObjectURL(this.observation.audioBlob);
        this.audioPlayer = new Audio(url);
        this.audioPlayer.addEventListener('ended', () => {
          this.isPlayingAudio = false;
          const icon = document.getElementById('detail-audio-icon');
          if (icon) icon.textContent = 'volume_up';
        });
      }

      const icon = document.getElementById('detail-audio-icon');
      if (this.isPlayingAudio) {
        this.audioPlayer.pause();
        this.isPlayingAudio = false;
        if (icon) icon.textContent = 'volume_up';
      } else {
        this.audioPlayer.play();
        this.isPlayingAudio = true;
        if (icon) icon.textContent = 'pause';
      }
    });
  }

  private cleanupAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }
  }
}
