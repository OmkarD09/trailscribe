import { db } from '../../storage/db';
import type { AdventureSessionSummary } from './AdventureModeView';
import type { FieldObservation } from '../../storage/types';
import { getModelRunner } from '../../runner';
import { AudioFeedback } from '../../utils/audio-helpers';

export class AdventureCompleteView {
  private container: HTMLElement;
  private onViewJournal: () => void;
  private onStartAnother: () => void;
  private onOpenMap?: () => void;
  private sessionSummary?: AdventureSessionSummary;
  private onSelectSpecimen?: (id: string) => void;

  constructor(
    container: HTMLElement,
    callbacks: {
      onViewJournal: () => void;
      onStartAnother: () => void;
      onOpenMap?: () => void;
      onSelectSpecimen?: (id: string) => void;
    },
    sessionSummary?: AdventureSessionSummary
  ) {
    this.container = container;
    this.onViewJournal = callbacks.onViewJournal;
    this.onStartAnother = callbacks.onStartAnother;
    this.onOpenMap = callbacks.onOpenMap;
    this.onSelectSpecimen = callbacks.onSelectSpecimen;
    this.sessionSummary = sessionSummary;
  }

  async render(): Promise<void> {
    const minutes = this.sessionSummary?.minutes ?? 38;
    const distance = this.sessionSummary?.distanceKm ?? 2.7;
    const discoveries = this.sessionSummary?.discoveriesCount ?? 5;
    const phoneFreePercent = this.sessionSummary?.phoneFreePercent ?? 71;
    const phoneFreeMinutes = Math.round(minutes * (phoneFreePercent / 100));

    // Fetch recent observations from offline ledger
    const recentObservations = await db.getRecentObservations(6);

    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-28 view-enter">
        <div class="px-margin pt-space-md flex flex-col items-center text-center">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container shadow-sm mb-space-sm">
            <span class="w-2 h-2 rounded-full bg-secondary"></span>
            <span class="font-label-sm text-label-sm tracking-widest uppercase font-bold">Expedition Concluded</span>
          </div>
          <h2 class="font-display-lg-mobile text-display-lg-mobile text-primary font-medium tracking-tight mt-1 mb-1 font-serif">
            You touched grass.
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-[320px] leading-relaxed">
            ${minutes} minutes outside. ${phoneFreeMinutes} minutes without looking at your phone.
          </p>
          <div class="w-full mt-space-md bg-sage-fill/40 rounded-xl p-3 flex items-center justify-between shadow-sm border border-outline-hairline/60">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-base">
                🌱
              </div>
              <div class="text-left">
                <span class="block font-title-md text-title-md text-primary leading-tight font-semibold">${phoneFreePercent}% Phone-Free Presence</span>
                <span class="block font-body-sm text-body-sm text-on-surface-variant">${phoneFreeMinutes} uninterrupted analog minutes</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-secondary text-[22px]">verified</span>
          </div>
        </div>

        <div class="px-margin mt-space-md grid grid-cols-3 gap-space-sm">
          <div class="bg-surface-card rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm border border-outline-hairline/60">
            <span class="font-headline-md text-headline-md text-primary font-medium font-serif">${distance}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-0.5">Kilometers</span>
          </div>
          <div class="bg-surface-card rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm border border-outline-hairline/60">
            <span class="font-headline-md text-headline-md text-primary font-medium font-serif">${minutes}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-0.5">Min Outside</span>
          </div>
          <div class="bg-surface-card rounded-xl p-3.5 flex flex-col items-center justify-center text-center shadow-sm border border-outline-hairline/60">
            <span class="font-headline-md text-headline-md text-primary font-medium font-serif">${discoveries}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-0.5">Discoveries</span>
          </div>
        </div>

        <!-- Loop Map Card -->
        <div class="px-margin mt-space-lg">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline/60 cursor-pointer hover:border-secondary active:scale-[0.99] transition-all" id="loop-map-card" title="Open Interactive Offline Map">
            <div class="flex items-center justify-between mb-space-sm">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary text-[18px]">route</span>
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Blackwood Ridge Circuit</span>
              </div>
              <div class="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                <span>View Map</span>
                <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
              </div>
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

        <!-- Gemma 2:2B Expedition Storyteller Dispatch Card -->
        <div class="px-margin mt-space-lg">
          <div class="relative bg-surface-card rounded-xl p-space-md shadow-md border border-secondary/40 overflow-hidden flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                  NATURALIST DISPATCH · GEMMA 2:2B
                </span>
              </div>
              <button id="synthesize-dispatch-btn" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-container text-primary active:scale-95 transition-all text-xs font-semibold cursor-pointer border border-outline-hairline/60">
                <span class="material-symbols-outlined text-[15px] text-tertiary-fixed-dim" id="dispatch-spinner-icon">psychology</span>
                <span id="dispatch-btn-label">Synthesize Prose</span>
              </button>
            </div>

            <div id="dispatch-content-box" class="flex flex-col gap-2.5 bg-surface-container-low rounded-xl p-3.5 border-l-4 border-tertiary-fixed-dim">
              <h4 id="dispatch-headline" class="font-title-md text-title-md text-primary font-serif font-bold italic">
                Field Dispatch: Traversal of Blackwood Ridge Circuit
              </h4>
              <p id="dispatch-story" class="font-body-sm text-[12.5px] text-on-surface leading-relaxed whitespace-pre-line font-serif">
Under an amber afternoon canopy, our boots traced ${distance} kilometers along the undulations of Blackwood Ridge Circuit. For ${minutes} uninterrupted minutes—with ${phoneFreePercent}% spent in total analog immersion—the forest revealed itself not through pixels, but through subtle sensory cues: the rustle of dry leaf litter and the scent of damp loam.

Our journey yielded ${discoveries} distinct biological occurrences. When modern screens are quieted, the eye sharpens to microhabitats once overlooked; every mossy crevice and harmonic canopy whistle bears witness to an ancient, flourishing biome.
              </p>
              <div class="pt-2 border-t border-outline-hairline/60 flex items-center justify-between">
                <p id="dispatch-quote" class="text-[11px] italic text-secondary font-serif">
                  "In every walk with nature, one receives far more than he seeks."
                </p>
                <div class="flex items-center gap-1.5">
                  <button id="copy-dispatch-btn" class="p-1 rounded-md hover:bg-surface-container text-secondary hover:text-primary transition-colors cursor-pointer" title="Copy Field Dispatch">
                    <span class="material-symbols-outlined text-[16px]" id="copy-icon">content_copy</span>
                  </button>
                  <button id="read-dispatch-btn" class="p-1 rounded-md hover:bg-surface-container text-secondary hover:text-primary transition-colors cursor-pointer" title="Listen to Dispatch">
                    <span class="material-symbols-outlined text-[16px]" id="audio-read-icon">volume_up</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between text-[10px] font-mono text-outline pt-0.5">
              <span id="dispatch-engine-badge">Engine: Gemma 2:2B (Offline / WebGPU / Heuristic)</span>
              <span class="text-emerald-700 font-semibold">100% Zero-Cloud Private</span>
            </div>
          </div>
        </div>

        <!-- You Found Today Horizontal Scroll Stream -->
        <div class="mt-space-lg flex flex-col">
          <div class="px-margin flex items-center justify-between mb-space-sm">
            <div class="flex items-center gap-2">
              <h3 class="font-headline-md text-headline-md text-primary font-medium leading-none font-serif">You Found Today</h3>
              <span class="font-label-sm text-label-sm bg-sage-fill text-primary px-2 py-0.5 rounded-full font-bold">
                ${recentObservations.length > 0 ? recentObservations.length : discoveries} Specimens
              </span>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant">Archived offline</span>
          </div>
          <div class="flex gap-space-sm overflow-x-auto px-margin pb-1" id="scroller-observations-container">
            ${this.renderSpecimenCards(recentObservations)}
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

    this.bindEvents(recentObservations);
  }

  private renderSpecimenCards(observations: FieldObservation[]): string {
    if (observations.length === 0) {
      // Fallback Stitch specimens
      return `
        <div class="bg-surface-card rounded-xl p-3 shrink-0 w-44 shadow-sm flex flex-col border border-outline-hairline/60">
          <div class="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-surface-card-subtle">
            <img class="w-full h-full object-cover" alt="Asian Koel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZruNU5OzscDzFmOUIUrBq_rRAkMv7R9YeRyA9fWsbFGVdyE9yHiWUAjwn1MqTALLIhuMRAeuv0-0Qvemsq_VWA9qftsCctpNqit-zbPZ9fP0anyZGF6yapuhihIb9Dnh2DXvyo6gQME3Wm2dUj16Q_1n54IhQR7YQloKlq0iuhZOt0u1ft2Lj3C6NOXCtvXzWZhZGlZF4fwWc2anyK0rMy0oSWCMzx08pEju7Ykc74Ya2C82QDp9H"/>
            <div class="absolute top-1.5 right-1.5 bg-obsidian-scrim text-vellum-bg text-xs px-1.5 py-0.5 rounded">🐦 Bird</div>
          </div>
          <span class="font-title-md text-title-md text-primary leading-tight truncate font-serif">Asian Koel</span>
          <span class="font-latin-name text-latin-name italic text-secondary leading-tight mt-0.5 truncate font-serif">Eudynamys scolopaceus</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant mt-2">Today · Hanging Gardens</span>
        </div>
      `;
    }

    return observations
      .map((obs) => {
        const icon =
          obs.kingdomOrGroup === 'Aves'
            ? '🐦 Bird'
            : obs.kingdomOrGroup === 'Plantae'
            ? '🌿 Plant'
            : obs.kingdomOrGroup === 'Insecta'
            ? '🦋 Insect'
            : obs.kingdomOrGroup === 'Fungi'
            ? '🍄 Fungi'
            : '🐾 Fauna';

        return `
          <div class="debrief-specimen-card bg-surface-card rounded-xl p-3 shrink-0 w-44 shadow-sm flex flex-col border border-outline-hairline/60 cursor-pointer active:scale-95 transition-transform" data-id="${obs.id}">
            <div class="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-surface-card-subtle">
              <img class="w-full h-full object-cover" alt="${obs.commonName || 'Specimen'}" src="${obs.photoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZruNU5OzscDzFmOUIUrBq_rRAkMv7R9YeRyA9fWsbFGVdyE9yHiWUAjwn1MqTALLIhuMRAeuv0-0Qvemsq_VWA9qftsCctpNqit-zbPZ9fP0anyZGF6yapuhihIb9Dnh2DXvyo6gQME3Wm2dUj16Q_1n54IhQR7YQloKlq0iuhZOt0u1ft2Lj3C6NOXCtvXzWZhZGlZF4fwWc2anyK0rMy0oSWCMzx08pEju7Ykc74Ya2C82QDp9H'}"/>
              <div class="absolute top-1.5 right-1.5 bg-obsidian-scrim text-vellum-bg text-xs px-1.5 py-0.5 rounded">
                ${icon}
              </div>
            </div>
            <span class="font-title-md text-title-md text-primary leading-tight truncate font-serif">${obs.commonName || 'Specimen'}</span>
            <span class="font-latin-name text-latin-name italic text-secondary leading-tight mt-0.5 truncate font-serif">${obs.scientificName || 'Unknown taxa'}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant mt-2 truncate">${obs.readableDate}</span>
          </div>
        `;
      })
      .join('');
  }

  private bindEvents(observations: FieldObservation[] = []): void {
    const loopMapCard = this.container.querySelector('#loop-map-card');
    loopMapCard?.addEventListener('click', () => {
      if (this.onOpenMap) {
        this.onOpenMap();
      } else {
        this.onViewJournal();
      }
    });

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

    // Gemma Dispatch Storyteller Logic
    const synthBtn = this.container.querySelector('#synthesize-dispatch-btn');
    const synthSpinner = this.container.querySelector('#dispatch-spinner-icon');
    const synthLabel = this.container.querySelector('#dispatch-btn-label');
    const headlineEl = this.container.querySelector('#dispatch-headline');
    const storyEl = this.container.querySelector('#dispatch-story');
    const quoteEl = this.container.querySelector('#dispatch-quote');
    const engineBadgeEl = this.container.querySelector('#dispatch-engine-badge');

    synthBtn?.addEventListener('click', async () => {
      if (synthSpinner && synthLabel && synthBtn) {
        synthLabel.textContent = 'Gemma Reasoning...';
        synthSpinner.classList.add('animate-spin');
        synthBtn.setAttribute('disabled', 'true');

        AudioFeedback.playTone('snapshot');

        try {
          const runner = getModelRunner();
          if (runner.generateExpeditionDispatch) {
            const dispatch = await runner.generateExpeditionDispatch({
              minutes: this.sessionSummary?.minutes ?? 38,
              distanceKm: this.sessionSummary?.distanceKm ?? 2.7,
              discoveriesCount: this.sessionSummary?.discoveriesCount ?? 5,
              phoneFreePercent: this.sessionSummary?.phoneFreePercent ?? 71,
              specimens: observations.map((o) => ({
                commonName: o.commonName,
                scientificName: o.scientificName,
                habitat: o.habitat
              })),
              trailName: 'Blackwood Ridge Circuit'
            });

            if (headlineEl) headlineEl.textContent = dispatch.title;
            if (storyEl) storyEl.textContent = dispatch.story;
            if (quoteEl) quoteEl.textContent = dispatch.excerpt;
            if (engineBadgeEl) engineBadgeEl.textContent = `Engine: ${dispatch.modelUsed}`;
            AudioFeedback.playTone('save');
          }
        } catch (err) {
          console.warn('Dispatch synthesis notice:', err);
        } finally {
          synthLabel.textContent = 'Regenerate Dispatch';
          synthSpinner.classList.remove('animate-spin');
          synthBtn.removeAttribute('disabled');
        }
      }
    });

    // Copy dispatch to clipboard
    const copyBtn = this.container.querySelector('#copy-dispatch-btn');
    const copyIcon = this.container.querySelector('#copy-icon');
    copyBtn?.addEventListener('click', () => {
      const text = `${headlineEl?.textContent || ''}\n\n${storyEl?.textContent || ''}\n\n${quoteEl?.textContent || ''}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        if (copyIcon) {
          copyIcon.textContent = 'check';
          setTimeout(() => {
            copyIcon.textContent = 'content_copy';
          }, 1500);
        }
      }
    });

    // Read aloud via SpeechSynthesis
    const readBtn = this.container.querySelector('#read-dispatch-btn');
    const readIcon = this.container.querySelector('#audio-read-icon');
    let isSpeaking = false;
    readBtn?.addEventListener('click', () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (isSpeaking) {
          window.speechSynthesis.cancel();
          isSpeaking = false;
          if (readIcon) readIcon.textContent = 'volume_up';
        } else {
          const text = `${headlineEl?.textContent || ''}. ${storyEl?.textContent || ''}`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.pitch = 0.98;
          utterance.onend = () => {
            isSpeaking = false;
            if (readIcon) readIcon.textContent = 'volume_up';
          };
          window.speechSynthesis.speak(utterance);
          isSpeaking = true;
          if (readIcon) readIcon.textContent = 'volume_off';
        }
      }
    });

    const cards = this.container.querySelectorAll('.debrief-specimen-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (id && this.onSelectSpecimen) {
          this.onSelectSpecimen(id);
        } else {
          this.onViewJournal();
        }
      });
    });
  }
}
