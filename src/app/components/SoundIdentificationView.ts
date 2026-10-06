import { db } from '../../storage/db';
import { AudioFeedback } from '../../utils/audio-helpers';
import { getModelRunner } from '../../runner';
import { FieldEntityParser } from '../../runner/parser';
import type { FieldObservation } from '../../storage/types';

export class SoundIdentificationView {
  private container: HTMLElement;
  private onAddToJournal: () => void;
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private isListening: boolean = false;
  private simPhase: number = 0;

  constructor(
    container: HTMLElement,
    callbacks: {
      onAddToJournal: () => void;
    }
  ) {
    this.container = container;
    this.onAddToJournal = callbacks.onAddToJournal;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-28 view-enter">
        <!-- Status Context Ribbon -->
        <div class="px-margin pt-space-sm pb-space-xs flex items-center justify-between">
          <div class="flex items-center gap-space-xs">
            <span class="w-2 h-2 rounded-full bg-amber-on-container animate-ping" id="audio-sensor-ping"></span>
            <span class="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold" id="audio-sensor-status">Acoustic Sensor Active</span>
          </div>
          <button id="toggle-mic-btn" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant shadow-sm hover:bg-surface-container active:scale-95 transition-all cursor-pointer audio-ripple">
            <span class="material-symbols-outlined text-[13px] text-secondary">mic</span>
            <span class="font-label-sm text-label-sm font-bold tracking-tight" id="mic-feed-label">48.2 kHz Raw Feed</span>
          </button>
        </div>

        <!-- Primary Sound Monitoring Viewport -->
        <div class="px-margin my-space-xs">
          <div class="relative w-full rounded-xl bg-primary-container text-vellum-bg p-space-md shadow-md overflow-hidden flex flex-col justify-between" style="min-height: 290px;">
            <!-- Subtle Optical Field Matrix Grid -->
            <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 1px 1px, #d3e0d8 1px, transparent 0); background-size: 20px 20px;"></div>
            
            <!-- Top Hud Calibration Stats -->
            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center gap-1.5 bg-obsidian-scrim px-2.5 py-1 rounded-full">
                <span class="material-symbols-outlined text-[14px] text-tertiary-fixed-dim">mic</span>
                <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-wider font-semibold" id="mic-type-label">Omni Condenser</span>
              </div>
              <div class="flex items-center gap-2 bg-obsidian-scrim px-2.5 py-1 rounded-full">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim tracking-wide font-mono" id="band-range-label">1.8 - 4.4 kHz band</span>
              </div>
            </div>

            <!-- Live Dynamic Canvas Spectrogram & Sonogram HUD -->
            <div class="relative z-10 my-auto py-2 flex flex-col items-center justify-center">
              <!-- Canvas Frequency Spectrogram Waveform -->
              <div class="w-full h-36 relative flex items-center justify-center">
                <canvas id="spectrogram-canvas" class="w-full h-full rounded-lg" width="680" height="260"></canvas>
                
                <!-- Realtime Audio Target Reticle -->
                <div class="absolute right-4 top-2 bg-obsidian-scrim px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-ping"></span>
                  <span class="font-label-sm text-label-sm text-tertiary-fixed font-mono tracking-wider" id="capture-timer">CAPTURE 03.4s</span>
                </div>
              </div>
              <!-- Field Guidance Callout -->
              <p class="font-body-sm text-body-sm text-primary-fixed mt-1 text-center font-medium" id="audio-guidance-msg">
                Listening to canopy and brush. Harmonics tracked in real time.
              </p>
            </div>

            <!-- Spectrogram Scale & Frequency Anchors -->
            <div class="relative z-10 flex items-center justify-between text-on-primary-container font-label-sm text-label-sm font-mono pt-1">
              <span>0 Hz</span>
              <span class="text-tertiary-fixed-dim font-bold" id="dominant-peak-label">▲ 2.4 kHz (DOMINANT PEAK)</span>
              <span>8.0 kHz</span>
            </div>
          </div>
        </div>

        <!-- Specimen Acoustic Detection Card -->
        <div class="px-margin mt-space-sm">
          <div class="bg-surface-card rounded-xl p-space-md shadow-md flex flex-col gap-space-sm relative border border-outline-hairline/60">
            <!-- Species Header & Confidence -->
            <div class="flex items-start justify-between gap-space-sm">
              <div class="flex items-center gap-space-sm">
                <div class="w-12 h-12 rounded-xl bg-sage-fill flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <span class="material-symbols-outlined text-[26px]">music_note</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="font-label-sm text-label-sm text-amber-on-container uppercase tracking-wider font-bold">
                    FAUNA IDENTIFIED · BIO-ACOUSTICS
                  </span>
                  <h2 class="font-headline-lg text-headline-lg text-primary leading-tight truncate font-serif">
                    Asian Koel
                  </h2>
                  <span class="font-latin-name text-latin-name italic text-secondary leading-none">
                    Eudynamys scolopaceus
                  </span>
                </div>
              </div>
              <!-- Confidence Pill -->
              <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-container text-amber-on-container shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-[15px]">verified</span>
                <span class="font-label-sm text-label-sm font-bold tracking-tight">87% CONFIDENCE</span>
              </div>
            </div>

            <!-- Specimen Thumbnail & Bioacoustic Pattern Snippet -->
            <div class="flex gap-space-sm items-center bg-surface-container-low rounded-lg p-space-sm">
              <img class="w-14 h-14 rounded-lg object-cover shrink-0 shadow-sm" alt="Asian Koel in banyan foliage" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC63PjgUioWhD_BoFXGkSv8Fc2oRzJNBmtmUrfsIiKXC1DzdREby8XET9p4bIPxPdxr-QyEzD4rYFYvDIZi0Mmx7Q8HObi3dUIVBTIfv2FryFDdTaVg7WhScZHYtzRgPptyc9-finMJgnmh8Y1sZTzvZZOcubV5IZi91viUSswT7mRe51jq-BXObc9gOCPv_II9rLbx4OmxKJSykvrAPjsaPAsqAVmviTiwQ4WaAg2HpGO5ZiGyr0ct"/>
              <div class="flex flex-col min-w-0">
                <span class="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Acoustic Signature</span>
                <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  Detected from its characteristic ascending “ko-o-el” territorial call echoing through high branches.
                </p>
              </div>
            </div>

            <!-- Field Taxonomy Tags -->
            <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
                <span class="material-symbols-outlined text-[13px]">nest_multi_room</span>
                Cuculidae
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
                <span class="material-symbols-outlined text-[13px]">wb_sunny</span>
                Diurnal Vocalizer
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-fill text-primary font-label-md text-label-md">
                <span class="material-symbols-outlined text-[13px]">shield</span>
                IUCN Least Concern
              </span>
            </div>

            <!-- "Did You Know?" Fact Card Inset -->
            <div class="relative bg-surface-card-subtle rounded-lg p-space-sm pl-4 overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-on-container"></div>
              <p class="font-body-sm text-body-sm text-on-surface leading-snug">
                Brood parasitic species: they lay their olive-grey eggs in the nests of common crows, who incubate and feed the energetic chicks unnoticed.
              </p>
            </div>

            <!-- Discovery Metadata Tabular Strip -->
            <div class="bg-surface-container rounded-lg p-space-sm flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-secondary">pin_drop</span>
                <span class="truncate font-semibold">Hanging Gardens</span>
              </div>
              <span class="text-outline">·</span>
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-secondary">schedule</span>
                <span>07:42 AM</span>
              </div>
              <span class="text-outline">·</span>
              <div class="flex items-center gap-1 font-bold text-primary">
                <span class="material-symbols-outlined text-[15px] text-amber-on-container">explore</span>
                <span>Log #18</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Voice Audio Transcript & Field Annotation by Gemma 2:2B -->
        <div class="px-margin mt-space-sm">
          <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline/60 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-primary">
                <span class="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">mic_double</span>
                <span class="font-label-sm text-label-sm font-bold uppercase tracking-wider">VOICE FIELD LOG & TRANSCRIPT</span>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold" id="transcription-status">Gemma 2:2B NER</span>
            </div>
            <textarea id="sound-transcript-input" class="w-full bg-surface-container text-on-surface font-body-sm text-body-sm rounded-lg p-2.5 outline-none resize-none border border-outline-hairline/80 focus:border-tertiary-fixed" rows="2" placeholder="Record or type voice field transcript...">Bio-acoustic territory vocalization recorded via on-device condenser sensor. 2 adult Asian Koels in banyan canopy near moist foliage.</textarea>
            <div id="audio-entity-chips" class="flex flex-wrap gap-1.5 pt-0.5">
              <span class="px-2 py-0.5 rounded-full bg-secondary-container text-primary text-[11px] font-semibold">Count: 2</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-container text-amber-on-container text-[11px] font-semibold">Substrate: banyan canopy</span>
              <span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary text-[11px] font-semibold">Habitat: moist foliage</span>
              <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-primary text-[11px] font-semibold">Life Stage: adult</span>
            </div>
          </div>
        </div>

        <!-- Field Controls & Archival Action Strip -->
        <div class="px-margin mt-space-md flex flex-col gap-space-sm">
          <!-- Action Trigger (48px primary button) -->
          <button class="w-full h-12 rounded-lg bg-primary-container text-vellum-bg font-title-md text-title-md flex items-center justify-center gap-2 shadow-md active:bg-secondary active:scale-[0.99] transition-all cursor-pointer ambient-glow" id="addJournalBtn">
            <span class="material-symbols-outlined text-[20px]">library_add</span>
            <span>ADD TO JOURNAL</span>
          </button>
          <!-- Sub-Action & On-Device Whisper Indicator -->
          <div class="flex items-center justify-between px-1">
            <button class="h-10 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 active:bg-surface-container-high transition-all cursor-pointer" id="relistenBtn">
              <span class="material-symbols-outlined text-[17px] text-secondary">replay</span>
              <span>Re-listen (5s)</span>
            </button>
            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span class="font-label-sm text-label-sm uppercase font-bold tracking-wider">Local Audio AI · Bio-Acoustics</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.startSpectrogramLoop();
  }

  private bindEvents(): void {
    const transcriptInput = this.container.querySelector('#sound-transcript-input') as HTMLTextAreaElement | null;
    const chipsContainer = this.container.querySelector('#audio-entity-chips');
    const runner = getModelRunner();

    const parseAndRenderTranscript = async () => {
      if (!transcriptInput || !chipsContainer) return;
      const text = transcriptInput.value.trim();
      if (!text) {
        chipsContainer.innerHTML = '';
        return;
      }
      try {
        const entities = await runner.extractFieldEntities(text);
        const chips: string[] = [];
        if (entities.abundanceCount && entities.abundanceCount > 0) {
          chips.push(`<span class="px-2 py-0.5 rounded-full bg-secondary-container text-primary text-[11px] font-semibold">Count: ${entities.abundanceCount}</span>`);
        }
        if (entities.substrate) {
          chips.push(`<span class="px-2 py-0.5 rounded-full bg-amber-container text-amber-on-container text-[11px] font-semibold">Substrate: ${entities.substrate}</span>`);
        }
        if (entities.habitat) {
          chips.push(`<span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary text-[11px] font-semibold">Habitat: ${entities.habitat}</span>`);
        }
        if (entities.lifeStage) {
          chips.push(`<span class="px-2 py-0.5 rounded-full bg-surface-container-high text-primary text-[11px] font-semibold">Life Stage: ${entities.lifeStage}</span>`);
        }
        if (entities.speciesCandidates?.length > 0) {
          chips.push(`<span class="px-2 py-0.5 rounded-full bg-tertiary-fixed-dim/20 text-tertiary text-[11px] font-semibold">Taxa: ${entities.speciesCandidates[0]}</span>`);
        }
        chipsContainer.innerHTML = chips.join('');
      } catch {
        const fallback = FieldEntityParser.parse(text);
        const chips: string[] = [];
        if (fallback.abundanceCount) chips.push(`<span class="px-2 py-0.5 rounded-full bg-secondary-container text-primary text-[11px] font-semibold">Count: ${fallback.abundanceCount}</span>`);
        if (fallback.substrate) chips.push(`<span class="px-2 py-0.5 rounded-full bg-amber-container text-amber-on-container text-[11px] font-semibold">Substrate: ${fallback.substrate}</span>`);
        if (fallback.habitat) chips.push(`<span class="px-2 py-0.5 rounded-full bg-sage-fill text-primary text-[11px] font-semibold">Habitat: ${fallback.habitat}</span>`);
        chipsContainer.innerHTML = chips.join('');
      }
    };

    transcriptInput?.addEventListener('input', () => {
      parseAndRenderTranscript();
    });

    const addBtn = this.container.querySelector('#addJournalBtn');
    if (addBtn) {
      addBtn.addEventListener('click', async () => {
        const originalContent = addBtn.innerHTML;
        addBtn.classList.add('bg-secondary');
        addBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>RECORD ARCHIVED (#18)</span>';

        AudioFeedback.playTone('save');

        const transcriptText = transcriptInput?.value.trim() || 'Bio-acoustic territory vocalization recorded via on-device condenser sensor. 2 adult Asian Koels in banyan canopy near moist foliage.';
        let entities: any = null;
        try {
          entities = await runner.extractFieldEntities(transcriptText);
        } catch {
          entities = FieldEntityParser.parse(transcriptText);
        }

        // Commit observation into db with real extracted field entities
        const soundObs: FieldObservation = {
          id: `sound-${Date.now()}`,
          timestamp: Date.now(),
          readableDate: `Today · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          coordinates: { latitude: 18.9553, longitude: 72.8055, accuracy: 5 },
          photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC63PjgUioWhD_BoFXGkSv8Fc2oRzJNBmtmUrfsIiKXC1DzdREby8XET9p4bIPxPdxr-QyEzD4rYFYvDIZi0Mmx7Q8HObi3dUIVBTIfv2FryFDdTaVg7WhScZHYtzRgPptyc9-finMJgnmh8Y1sZTzvZZOcubV5IZi91viUSswT7mRe51jq-BXObc9gOCPv_II9rLbx4OmxKJSykvrAPjsaPAsqAVmviTiwQ4WaAg2HpGO5ZiGyr0ct',
          speciesCandidates: entities?.speciesCandidates?.length ? entities.speciesCandidates : ['Asian Koel', 'Eudynamys scolopaceus'],
          commonName: entities?.commonName && entities.commonName !== 'General Field Note' ? entities.commonName : 'Asian Koel (Acoustic Call)',
          scientificName: entities?.scientificName || 'Eudynamys scolopaceus',
          confidenceScore: 0.91,
          kingdomOrGroup: entities?.kingdomOrGroup || 'Aves',
          habitat: entities?.habitat || 'Acoustic canopy recording · Hanging Gardens',
          substrate: entities?.substrate || 'Ficus benghalensis branch',
          abundanceCount: entities?.abundanceCount || 2,
          lifeStage: entities?.lifeStage || 'adult',
          fieldNotes: transcriptText,
          synced: false
        };

        await db.saveObservation(soundObs);

        setTimeout(() => {
          addBtn.innerHTML = originalContent;
          addBtn.classList.remove('bg-secondary');
          this.stop();
          this.onAddToJournal();
        }, 1000);
      });
    }

    const relistenBtn = this.container.querySelector('#relistenBtn');
    relistenBtn?.addEventListener('click', () => {
      this.playSyntheticChirp();
    });

    const toggleMicBtn = this.container.querySelector('#toggle-mic-btn');
    toggleMicBtn?.addEventListener('click', () => {
      this.toggleMicrophoneStream();
    });
  }

  private async toggleMicrophoneStream(): Promise<void> {
    if (this.isListening) {
      this.stopMic();
      const label = this.container.querySelector('#mic-feed-label');
      if (label) label.textContent = 'Synthetic Feed';
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const source = this.audioContext.createMediaStreamSource(this.audioStream);
          this.analyserNode = this.audioContext.createAnalyser();
          this.analyserNode.fftSize = 256;
          source.connect(this.analyserNode);
          this.isListening = true;

          const label = this.container.querySelector('#mic-feed-label');
          if (label) label.textContent = 'Live Mic Feed';
          const micType = this.container.querySelector('#mic-type-label');
          if (micType) micType.textContent = 'Hardware Mic';
        }
      } catch (e) {
        console.warn('Microphone permission or hardware notice:', e);
      }
    }
  }

  private startSpectrogramLoop(): void {
    const canvas = this.container.querySelector('#spectrogram-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const freqData = new Uint8Array(128);

    const renderFrame = () => {
      this.simPhase += 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background Optical Reticle Grid
      ctx.strokeStyle = 'rgba(211, 224, 216, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 2. Frequency Data Extraction (Real Mic or Synthetic Harmonic)
      if (this.isListening && this.analyserNode) {
        this.analyserNode.getByteFrequencyData(freqData);
      } else {
        // Synthetic Asian Koel acoustic simulation
        for (let i = 0; i < 64; i++) {
          const harmonic = Math.sin(this.simPhase * 2 + i * 0.15) * 50;
          const peak = Math.exp(-Math.pow((i - 28) / 8, 2)) * 140;
          freqData[i] = Math.max(10, Math.min(255, 30 + harmonic + peak));
        }
      }

      // 3. Draw Vertical Sonogram Bars
      const barWidth = 6;
      const barSpacing = 4;
      const totalBars = 32;
      const startX = width / 2 - (totalBars * (barWidth + barSpacing)) / 2;

      for (let i = 0; i < totalBars; i++) {
        const val = freqData[i] || 20;
        const barHeight = (val / 255) * (height * 0.7);
        const x = startX + i * (barWidth + barSpacing);
        const y = height / 2 - barHeight / 2;

        if (i >= 12 && i <= 22) {
          // Dominant Peak Harmonic in Amber
          ctx.fillStyle = '#feb956';
        } else {
          // Sage ambient
          ctx.fillStyle = 'rgba(168, 206, 188, 0.45)';
        }
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      // 4. Draw Continuous Ambient Waveform (Muted Sage)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(130, 162, 145, 0.4)';
      ctx.lineWidth = 2;
      for (let x = 0; x <= width; x += 8) {
        const y = height / 2 + Math.sin(x * 0.03 + this.simPhase) * 16;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 5. Draw Focal Koel Harmonic Curve (Amber)
      ctx.beginPath();
      ctx.strokeStyle = '#feb956';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let x = 0; x <= width; x += 10) {
        const envelope = Math.exp(-Math.pow((x - width / 2) / 160, 2));
        const chirpWave = Math.sin(x * 0.08 - this.simPhase * 3) * 52 * envelope;
        const y = height / 2 + chirpWave;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      this.animationFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }

  private playSyntheticChirp(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(3600, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.36);
    } catch (e) {
      console.warn('AudioContext unavailable:', e);
    }
  }

  private stopMic(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((t) => t.stop());
      this.audioStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isListening = false;
  }

  public stop(): void {
    this.stopMic();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
