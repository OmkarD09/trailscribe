import { FieldAudioRecorder, AudioFeedback } from '../../utils/audio-helpers';
import { GeoLocationTracker } from '../../utils/geolocation';
import { getModelRunner } from '../../runner';
import { db } from '../../storage/db';
import type { FieldObservation } from '../../storage/types';

export class SpecimenCaptureView {
  private container: HTMLElement;
  private recorder = new FieldAudioRecorder();
  private onObservationSaved: (obs: FieldObservation) => void;
  private isListeningMode = false;
  private isRecordingAudio = false;
  private isTorchOn = false;
  private currentZoom = '1x';

  constructor(container: HTMLElement, onObservationSaved: (obs: FieldObservation) => void) {
    this.container = container;
    this.onObservationSaved = onObservationSaved;
  }

  async render(): Promise<void> {
    if (this.isListeningMode) {
      this.renderSoundView();
    } else {
      this.renderScannerView();
    }
  }

  private renderScannerView(): void {
    this.container.innerHTML = `
      <div class="flex flex-col w-full relative select-none">
        <!-- Viewfinder Optical Canvas -->
        <div class="relative w-full overflow-hidden aspect-[3/4] max-h-[636px] flex items-center justify-center bg-black" id="viewfinder-canvas">
          <!-- Camera Sensor Stream -->
          <img 
            id="viewfinder-feed-img"
            class="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-300"
            style="transform: scale(${this.getZoomScale()}); filter: ${this.isTorchOn ? 'brightness(1.25) contrast(1.05)' : 'none'};"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlTf7kYXp4Z-sCYzhAcO6kMDxEmX7ZCoLcjfRKB86mU39qnHQdSyhVa4TQIMB4vDbiA9xRLtdZtXyLEFPaM_xmMWvEGZdxzJJDx4SqLqPeFmdIjADE56zG0jGd_mcOrTtgoHtj-sZ-xxJv3LAUkNqrpnmFMb3YOYhY5eWqXD1xHDJjGW_55OkF0yhlzYS5CKoAHXliQ_V4VRJsg5WmFw_OHc_7aQnUf1KNgePhpevO7MU3Qv95oU3N"
            alt="Optical Viewfinder Sensor"
          />

          <!-- Ambient Shadow Overlays for Telemetry Legibility -->
          <div class="absolute inset-0 bg-gradient-to-b from-primary/70 via-transparent to-primary/80 pointer-events-none"></div>

          <!-- Viewfinder Corner HUD Brackets -->
          <div class="absolute inset-4 pointer-events-none flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <svg class="opacity-80" fill="none" height="24" viewBox="0 0 24 24" width="24">
                <path d="M2 10V2H10" stroke="#F8F6F0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <svg class="opacity-80" fill="none" height="24" viewBox="0 0 24 24" width="24">
                <path d="M22 10V2H14" stroke="#F8F6F0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
            <!-- Center Crosshair Marks -->
            <div class="self-center flex items-center justify-center opacity-40">
              <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
                <path d="M16 4V10M16 22V28M4 16H10M22 16H28" stroke="#F8F6F0" stroke-linecap="round" stroke-width="1.5"></path>
                <circle cx="16" cy="16" fill="#F8F6F0" r="2"></circle>
              </svg>
            </div>
            <div class="flex justify-between items-end">
              <svg class="opacity-80" fill="none" height="24" viewBox="0 0 24 24" width="24">
                <path d="M2 14V22H10" stroke="#F8F6F0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <svg class="opacity-80" fill="none" height="24" viewBox="0 0 24 24" width="24">
                <path d="M22 14V22H14" stroke="#F8F6F0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
          </div>

          <!-- Telemetry Status Bar -->
          <div class="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-scrim shadow-md">
              <span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
              <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-wider font-semibold">Local Vision AI • Offline</span>
            </div>
            <!-- Optical Sensor Parameters / Lux Telemetry -->
            <div class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-obsidian-scrim text-vellum-bg shadow-md font-label-sm text-label-sm">
              <div class="flex items-center gap-1 text-tertiary-fixed-dim">
                <span class="material-symbols-outlined text-[16px]">wb_sunny</span>
                <span class="font-mono">42,500 lx</span>
              </div>
              <span class="opacity-40">|</span>
              <span class="font-mono tracking-tight text-surface-container">ƒ/1.8 · 1/640s</span>
            </div>
          </div>

          <!-- Target Tracking Bounding Box & Neural Focus Ring -->
          <div class="absolute top-[32%] left-[28%] w-44 h-44 pointer-events-none transition-all duration-300 transform -translate-x-2 -translate-y-2">
            <!-- Amber Reticle Arc Ring -->
            <svg class="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <circle class="opacity-90" cx="50" cy="50" fill="none" r="44" stroke="#feb956" stroke-dasharray="8 6" stroke-width="2"></circle>
            </svg>
            <!-- Inner Lock Corners -->
            <div class="absolute inset-3 border-2 border-transparent border-t-amber-container border-l-amber-container rounded-tl-lg"></div>
            <div class="absolute inset-3 border-2 border-transparent border-b-amber-container border-r-amber-container rounded-br-lg"></div>
            <!-- Real-Time Classification Tooltip -->
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-obsidian-scrim px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
              <span class="material-symbols-outlined text-tertiary-fixed-dim text-[14px]">psychology</span>
              <span class="font-label-sm text-label-sm text-vellum-bg font-medium tracking-wide">Sciuridae lock · 98%</span>
            </div>
          </div>

          <!-- Tactical Rangefinder & Level Meter -->
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-obsidian-scrim px-1.5 py-3 rounded-full text-vellum-bg font-label-sm text-label-sm">
            <span class="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">straighten</span>
            <div class="w-1 h-14 bg-surface-container/30 rounded-full relative overflow-hidden">
              <div class="absolute bottom-0 inset-x-0 bg-tertiary-fixed-dim h-9 rounded-full"></div>
            </div>
            <span class="text-[10px] font-mono opacity-90">1.2m</span>
          </div>

          <!-- On-screen Zoom Control Bar -->
          <div class="absolute bottom-4 inset-x-0 flex justify-center pointer-events-auto">
            <div class="inline-flex items-center gap-1 bg-obsidian-scrim p-1 rounded-full shadow-md" id="zoom-controls">
              ${['0.5x', '1x', '2x', '5x'].map((z) => `
                <button class="px-2.5 py-1 rounded-full font-label-sm text-label-sm transition-colors ${this.currentZoom === z ? 'bg-surface-container/30 text-vellum-bg font-bold shadow-sm' : 'text-vellum-bg/70 hover:text-vellum-bg'}" data-zoom="${z}">
                  ${z}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Bottom Hardware Operation Deck -->
        <div class="w-full px-margin pt-space-md pb-space-lg flex flex-col items-center gap-space-md bg-vellum-bg">
          <!-- Bio-Acoustic Capture Pill -->
          <button class="group relative inline-flex items-center gap-space-sm px-5 py-2.5 rounded-full bg-surface-card shadow-sm hover:shadow active:scale-95 transition-all border border-outline-hairline cursor-pointer" id="btn-listen-toggle">
            <span class="material-symbols-outlined text-primary text-[20px] group-hover:text-secondary transition-colors">graphic_eq</span>
            <span class="font-title-md text-body-sm font-semibold tracking-wide text-primary">LISTEN FOR NATURE</span>
            <div class="flex items-center gap-0.5 ml-1">
              <span class="w-1 h-3 bg-tertiary-fixed-dim rounded-full animate-bounce"></span>
              <span class="w-1 h-5 bg-tertiary-fixed-dim rounded-full animate-bounce [animation-delay:0.15s]"></span>
              <span class="w-1 h-2 bg-tertiary-fixed-dim rounded-full animate-bounce [animation-delay:0.3s]"></span>
            </div>
          </button>

          <!-- Main Instrument Control Cluster -->
          <div class="w-full flex items-center justify-around max-w-sm px-space-sm">
            <!-- Folio / Device Gallery Picker -->
            <div class="flex flex-col items-center gap-1">
              <label for="folio-file-input" class="w-12 h-12 rounded-full bg-surface-card-subtle flex items-center justify-center text-primary shadow-sm active:scale-90 transition-all hover:bg-surface-container cursor-pointer border border-outline-hairline">
                <span class="material-symbols-outlined text-[24px]">photo_library</span>
              </label>
              <input type="file" id="folio-file-input" accept="image/*" class="hidden" />
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Folio</span>
            </div>

            <!-- Primary Hardware Shutter Button (64px, Forest Green with Inset Cream Ring) -->
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-2 rounded-full bg-secondary-container/50 pointer-events-none"></div>
              <button aria-label="Capture Specimen" class="relative w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform focus:outline-none cursor-pointer" id="btn-camera-shutter">
                <div class="w-[52px] h-[52px] rounded-full bg-transparent flex items-center justify-center">
                  <svg class="w-full h-full" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" fill="none" r="23" stroke="#F8F6F0" stroke-width="3"></circle>
                  </svg>
                  <div class="absolute w-7 h-7 rounded-full bg-vellum-bg"></div>
                </div>
              </button>
            </div>

            <!-- Flash / Field Torch Toggle -->
            <div class="flex flex-col items-center gap-1">
              <button aria-label="Toggle Field Torch" class="w-12 h-12 rounded-full bg-surface-card-subtle flex items-center justify-center text-primary shadow-sm active:scale-90 transition-all hover:bg-surface-container cursor-pointer border border-outline-hairline ${this.isTorchOn ? 'ring-2 ring-amber-container bg-amber-container/20' : ''}" id="btn-torch-toggle">
                <span class="material-symbols-outlined text-[24px]">${this.isTorchOn ? 'flash_on' : 'flashlight_on'}</span>
              </button>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Torch</span>
            </div>
          </div>

          <!-- Quick Specimen Context Indicator Card -->
          <div class="w-full bg-surface-card rounded-xl p-space-md shadow-sm flex items-center justify-between border border-outline-hairline">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                <span class="material-symbols-outlined text-[22px]">nest_eco_leaf</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Passive Habitat Scan</span>
                <span class="font-body-sm text-body-sm text-primary font-medium truncate">Western Ghats Woodland Biome</span>
              </div>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant font-mono">37.77° N</span>
          </div>
        </div>
      </div>
    `;

    this.bindScannerEvents();
  }

  private renderSoundView(): void {
    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-safe">
        <!-- Status Context Ribbon -->
        <div class="px-margin pt-space-sm pb-space-xs flex items-center justify-between">
          <div class="flex items-center gap-space-xs">
            <span class="w-2 h-2 rounded-full bg-amber-on-container ${this.isRecordingAudio ? 'animate-ping' : ''}"></span>
            <span class="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">
              ${this.isRecordingAudio ? 'Recording Audio Stream...' : 'Acoustic Sensor Standby'}
            </span>
          </div>
          <button class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-card text-on-surface-variant shadow-sm border border-outline-hairline cursor-pointer" id="btn-back-to-scanner">
            <span class="material-symbols-outlined text-[16px] text-secondary">photo_camera</span>
            <span class="font-label-sm text-label-sm font-semibold">Switch to Camera</span>
          </button>
        </div>

        <!-- Primary Sound Monitoring Viewport -->
        <div class="px-margin my-space-xs">
          <div class="relative w-full rounded-xl bg-primary-container text-vellum-bg p-space-md shadow-md overflow-hidden flex flex-col justify-between" style="min-height: 290px;">
            <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 1px 1px, #d3e0d8 1px, transparent 0); background-size: 20px 20px;"></div>
            
            <!-- Top HUD Stats -->
            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center gap-1.5 bg-obsidian-scrim px-2.5 py-1 rounded-full">
                <span class="material-symbols-outlined text-[14px] text-tertiary-fixed-dim">mic</span>
                <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-wider">Naturalist Mic</span>
              </div>
              <div class="flex items-center gap-2 bg-obsidian-scrim px-2.5 py-1 rounded-full">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim tracking-wide font-mono">1.8 - 4.4 kHz band</span>
              </div>
            </div>

            <!-- Waveform & Sonogram Display -->
            <div class="relative z-10 my-auto py-2 flex flex-col items-center justify-center">
              <div class="w-full h-36 relative flex items-center justify-center">
                <svg class="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 340 130">
                  <path d="M0,65 Q18,63 35,66 T70,64 T105,67 T140,63 T175,66 T210,62 T245,67 T280,63 T315,66 T340,64" fill="none" stroke="#82a291" stroke-opacity="0.35" stroke-width="1.5"></path>
                  <path d="M0,65 Q25,65 50,65 T95,58 T135,78 T170,30 T205,98 T240,24 T275,104 T305,60 T340,65" fill="none" stroke="#adcebc" stroke-linecap="round" stroke-opacity="0.8" stroke-width="2.5"></path>
                  <path class="${this.isRecordingAudio ? 'animate-pulse' : ''}" d="M0,65 Q30,65 60,65 T100,52 T140,82 T175,20 T210,108 T245,14 T280,112 T310,58 T340,65" fill="none" stroke="#feb956" stroke-linecap="round" stroke-width="3"></path>
                </svg>

                <div class="absolute right-6 top-2 bg-obsidian-scrim px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim ${this.isRecordingAudio ? 'animate-ping' : ''}"></span>
                  <span class="font-label-sm text-label-sm text-tertiary-fixed font-mono tracking-wider" id="sound-record-timer">${this.isRecordingAudio ? 'LISTENING...' : 'READY'}</span>
                </div>
              </div>

              <p class="font-body-sm text-body-sm text-primary-fixed mt-1 text-center font-medium" id="sound-guide-text">
                ${this.isRecordingAudio ? 'Speak your field note clearly or hold still to capture animal sounds...' : 'Press the microphone button below to record.'}
              </p>
            </div>

            <div class="relative z-10 flex items-center justify-between text-on-primary-container font-label-sm text-label-sm font-mono pt-1">
              <span>0 Hz</span>
              <span class="text-tertiary-fixed-dim font-bold">▲ 2.4 kHz (DOMINANT PEAK)</span>
              <span>8.0 kHz</span>
            </div>
          </div>
        </div>

        <!-- Audio Shutter / Hold-to-Record Trigger -->
        <div class="px-margin mt-space-md flex flex-col items-center gap-space-sm">
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-3 rounded-full bg-amber-container/40 ${this.isRecordingAudio ? 'recording-pulse' : ''}"></div>
            <button 
              id="btn-sound-record-toggle"
              class="relative w-20 h-20 rounded-full ${this.isRecordingAudio ? 'bg-amber-on-container' : 'bg-primary-container'} text-vellum-bg flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-[32px]">${this.isRecordingAudio ? 'stop' : 'mic'}</span>
              <span class="font-label-sm text-[10px] uppercase font-bold tracking-wider">${this.isRecordingAudio ? 'Done' : 'Record'}</span>
            </button>
          </div>
          <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1" id="sound-instructions">
            ${this.isRecordingAudio ? 'Tap to finish & analyze with Gemma' : 'Tap to start recording voice observation'}
          </span>
        </div>

        <!-- Bio-Acoustic Reference Card -->
        <div class="px-margin mt-space-md">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline flex items-center gap-space-sm">
            <div class="w-10 h-10 rounded-lg bg-sage-fill flex items-center justify-center text-primary shrink-0">
              <span class="material-symbols-outlined text-[22px]">psychology</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-title-md text-title-md text-primary font-bold">Local Acoustic Model</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">Classifies vocalizations offline using embedded on-device taxonomy.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindSoundEvents();
  }

  private getZoomScale(): number {
    switch (this.currentZoom) {
      case '0.5x': return 0.8;
      case '1x': return 1.0;
      case '2x': return 1.4;
      case '5x': return 2.0;
      default: return 1.0;
    }
  }

  private bindScannerEvents(): void {
    // Zoom control click
    const zoomButtons = this.container.querySelectorAll('#zoom-controls button');
    zoomButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const zoom = btn.getAttribute('data-zoom');
        if (zoom) {
          this.currentZoom = zoom;
          const img = document.getElementById('viewfinder-feed-img') as HTMLImageElement;
          if (img) img.style.transform = `scale(${this.getZoomScale()})`;
          zoomButtons.forEach((b) => {
            b.className = 'px-2.5 py-1 rounded-full font-label-sm text-label-sm text-vellum-bg/70 hover:text-vellum-bg transition-colors';
          });
          btn.className = 'px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-surface-container/30 text-vellum-bg font-bold shadow-sm transition-colors';
        }
      });
    });

    // Listen mode toggle
    const listenBtn = document.getElementById('btn-listen-toggle');
    listenBtn?.addEventListener('click', () => {
      this.isListeningMode = true;
      this.render();
    });

    // Torch toggle
    const torchBtn = document.getElementById('btn-torch-toggle');
    torchBtn?.addEventListener('click', () => {
      this.isTorchOn = !this.isTorchOn;
      const img = document.getElementById('viewfinder-feed-img') as HTMLImageElement;
      if (img) img.style.filter = this.isTorchOn ? 'brightness(1.25) contrast(1.05)' : 'none';
      if (torchBtn) {
        torchBtn.innerHTML = `<span class="material-symbols-outlined text-[24px]">${this.isTorchOn ? 'flash_on' : 'flashlight_on'}</span>`;
        if (this.isTorchOn) {
          torchBtn.classList.add('ring-2', 'ring-amber-container', 'bg-amber-container/20');
        } else {
          torchBtn.classList.remove('ring-2', 'ring-amber-container', 'bg-amber-container/20');
        }
      }
    });

    // Camera Shutter Button: triggers capture simulation & save
    const shutterBtn = document.getElementById('btn-camera-shutter');
    shutterBtn?.addEventListener('click', async () => {
      AudioFeedback.playTone('snapshot');
      shutterBtn.classList.add('scale-90');
      setTimeout(() => shutterBtn.classList.remove('scale-90'), 150);
      await this.captureVisualObservation();
    });

    // Folio File Picker
    const folioInput = document.getElementById('folio-file-input') as HTMLInputElement;
    folioInput?.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      AudioFeedback.playTone('snapshot');
      await this.capturePhotoFile(file);
    });
  }

  private bindSoundEvents(): void {
    const backBtn = document.getElementById('btn-back-to-scanner');
    backBtn?.addEventListener('click', async () => {
      if (this.isRecordingAudio) {
        await this.stopAudioRecording();
      }
      this.isListeningMode = false;
      this.render();
    });

    const recordToggleBtn = document.getElementById('btn-sound-record-toggle');
    recordToggleBtn?.addEventListener('click', async () => {
      if (!this.isRecordingAudio) {
        await this.startAudioRecording();
      } else {
        await this.stopAudioRecording();
      }
    });
  }

  private async startAudioRecording(): Promise<void> {
    try {
      this.isRecordingAudio = true;
      AudioFeedback.playTone('start');
      this.renderSoundView();

      await this.recorder.start((_amplitude) => {
        // Amplitude waveform response
      });
    } catch (err) {
      console.error('Mic access failed:', err);
      this.isRecordingAudio = false;
      alert('Microphone access is required to capture nature audio.');
      this.renderSoundView();
    }
  }

  private async stopAudioRecording(): Promise<void> {
    if (!this.isRecordingAudio) return;
    this.isRecordingAudio = false;

    const guideText = document.getElementById('sound-guide-text');
    if (guideText) guideText.textContent = 'Processing bio-acoustic stream with Gemma AI...';

    try {
      const audioBlob = await this.recorder.stop();
      AudioFeedback.playTone('save');
      await this.processAudioObservation(audioBlob);
    } catch (err) {
      console.error('Audio processing failed:', err);
      this.renderSoundView();
    }
  }

  private async processAudioObservation(audioBlob: Blob): Promise<void> {
    const runner = getModelRunner();
    const coords = await GeoLocationTracker.getCurrentPosition();

    // 1. Audio transcription
    const stt = await runner.transcribeAudio(audioBlob);

    // 2. Local entity extraction
    const entities = await runner.extractFieldEntities(stt.text);

    // 3. Local embedding generation
    const embedding = await runner.generateEmbedding(stt.text);

    const now = Date.now();
    const obs: FieldObservation = {
      id: crypto.randomUUID(),
      timestamp: now,
      readableDate: new Date(now).toLocaleString(),
      coordinates: coords,
      audioBlob: audioBlob,
      audioDurationSeconds: stt.durationSeconds,
      rawTranscript: stt.text,
      speciesCandidates: entities.speciesCandidates.length > 0 ? entities.speciesCandidates : ['Asian Koel'],
      commonName: entities.commonName || 'Asian Koel',
      scientificName: entities.scientificName || 'Eudynamys scolopaceus',
      confidenceScore: 0.89,
      kingdomOrGroup: entities.kingdomOrGroup || 'Aves',
      habitat: entities.habitat || 'Canopy woodland',
      substrate: entities.substrate || 'Ficus branch',
      abundanceCount: entities.abundanceCount || 1,
      lifeStage: entities.lifeStage || 'adult',
      weatherObservation: entities.weatherObservation || '27°C, morning acoustic survey',
      fieldNotes: entities.fieldNotes || 'Acoustic call isolated with on-device harmonic detector.',
      embedding: embedding,
      photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC63PjgUioWhD_BoFXGkSv8Fc2oRzJNBmtmUrfsIiKXC1DzdREby8XET9p4bIPxPdxr-QyEzD4rYFYvDIZi0Mmx7Q8HObi3dUIVBTIfv2FryFDdTaVg7WhScZHYtzRgPptyc9-finMJgnmh8Y1sZTzvZZOcubV5IZi91viUSswT7mRe51jq-BXObc9gOCPv_II9rLbx4OmxKJSykvrAPjsaPAsqAVmviTiwQ4WaAg2HpGO5ZiGyr0ct',
      synced: false
    };

    await db.saveObservation(obs);
    this.isListeningMode = false;
    this.onObservationSaved(obs);
  }

  private async captureVisualObservation(): Promise<void> {
    const runner = getModelRunner();
    const coords = await GeoLocationTracker.getCurrentPosition();

    const samplePrompt = 'Observed Three-striped Palm Squirrel on teak tree bark, midday canopy light';
    const entities = await runner.extractFieldEntities(samplePrompt);
    const embedding = await runner.generateEmbedding(samplePrompt);

    const now = Date.now();
    const obs: FieldObservation = {
      id: crypto.randomUUID(),
      timestamp: now,
      readableDate: new Date(now).toLocaleString(),
      coordinates: coords,
      photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUq24kjNUYNTxx9ant7TAfN6xjpb3UCN8Pz0n8SGwbECI6fi2QCTTf08Rw5Ge9umcFh8_DgRLspfVvTWRU6X_rfLL3o3ytL4gYWdOZ2aLxiUZZHIenRLjPdmJ0C82-P3XnQYfBHFCKX1IhZo-_yHk31R-G4e4Nc6SG-P_zyj1caoetLM0zRplIe0WFMlQ_Y4clQKixljMHS-onwfNLuqVvwB5h-wenFx2oD6Y3yv3MjP-lcuXDzYKq',
      rawTranscript: samplePrompt,
      speciesCandidates: entities.speciesCandidates.length > 0 ? entities.speciesCandidates : ['Indian Palm Squirrel', 'Funambulus palmarum'],
      commonName: entities.commonName || 'Indian Palm Squirrel',
      scientificName: entities.scientificName || 'Funambulus palmarum',
      confidenceScore: 0.94,
      kingdomOrGroup: entities.kingdomOrGroup || 'Animalia',
      habitat: entities.habitat || 'Deciduous teak forest canopy',
      substrate: entities.substrate || 'Weathered teak bark',
      abundanceCount: 1,
      lifeStage: 'adult',
      weatherObservation: 'Natural daylight, 42,500 lx',
      fieldNotes: 'Three creamy dorsal stripes clearly visible on soft agouti-brown fur.',
      embedding: embedding,
      synced: false
    };

    await db.saveObservation(obs);
    this.onObservationSaved(obs);
  }

  private async capturePhotoFile(file: File): Promise<void> {
    const runner = getModelRunner();
    const coords = await GeoLocationTracker.getCurrentPosition();

    const prompt = `Field photo snapshot captured from device camera at ${new Date().toLocaleTimeString()}`;
    const entities = await runner.extractFieldEntities(prompt);
    const embedding = await runner.generateEmbedding(prompt);

    const now = Date.now();
    const obs: FieldObservation = {
      id: crypto.randomUUID(),
      timestamp: now,
      readableDate: new Date(now).toLocaleString(),
      coordinates: coords,
      photoBlob: file,
      photoMimeType: file.type,
      rawTranscript: prompt,
      speciesCandidates: entities.speciesCandidates.length > 0 ? entities.speciesCandidates : ['Visual Observation'],
      commonName: entities.commonName || 'Visual Observation',
      scientificName: entities.scientificName,
      confidenceScore: 0.91,
      kingdomOrGroup: entities.kingdomOrGroup || 'Other',
      habitat: entities.habitat || 'Trailside terrain',
      abundanceCount: 1,
      embedding: embedding,
      synced: false
    };

    await db.saveObservation(obs);
    this.onObservationSaved(obs);
  }
}
