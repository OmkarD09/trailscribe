export class SoundIdentificationView {
  private container: HTMLElement;
  private onAddToJournal: () => void;

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
      <div class="flex flex-col w-full pb-safe view-enter">
        <!-- Status Context Ribbon -->
        <div class="px-margin pt-space-sm pb-space-xs flex items-center justify-between">
          <div class="flex items-center gap-space-xs">
            <span class="w-2 h-2 rounded-full bg-amber-on-container animate-ping"></span>
            <span class="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">Acoustic Sensor Active</span>
          </div>
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant shadow-sm">
            <span class="material-symbols-outlined text-[13px] text-secondary">graphic_eq</span>
            <span class="font-label-sm text-label-sm font-bold tracking-tight">48.2 kHz Raw Feed</span>
          </div>
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
                <span class="font-label-sm text-label-sm text-vellum-bg uppercase tracking-wider font-semibold">Omni Condenser</span>
              </div>
              <div class="flex items-center gap-2 bg-obsidian-scrim px-2.5 py-1 rounded-full">
                <span class="font-label-sm text-label-sm text-tertiary-fixed-dim tracking-wide font-mono">1.8 - 4.4 kHz band</span>
              </div>
            </div>

            <!-- Live Dynamic Canvas Spectrogram & Sonogram HUD -->
            <div class="relative z-10 my-auto py-2 flex flex-col items-center justify-center">
              <!-- Frequency Spectrogram Waveform -->
              <div class="w-full h-36 relative flex items-center justify-center">
                <svg class="w-full h-full" fill="none" preserveaspectratio="none" viewbox="0 0 340 130">
                  <!-- Background Ambient Forest Noise Wave (Muted Sage) -->
                  <path d="M0,65 Q18,63 35,66 T70,64 T105,67 T140,63 T175,66 T210,62 T245,67 T280,63 T315,66 T340,64" fill="none" stroke="#82a291" stroke-opacity="0.35" stroke-width="1.5"></path>
                  <path d="M0,65 Q15,69 30,62 T60,68 T90,61 T120,67 T150,60 T180,68 T210,62 T240,69 T270,61 T300,67 T340,65" fill="none" stroke="#82a291" stroke-opacity="0.45" stroke-width="1.5"></path>
                  <!-- Focal Harmonic Asian Koel Call -->
                  <path d="M0,65 Q25,65 50,65 T95,58 T135,78 T170,30 T205,98 T240,24 T275,104 T305,60 T340,65" fill="none" id="bio-pulse-base" stroke="#adcebc" stroke-linecap="round" stroke-opacity="0.8" stroke-width="2.5"></path>
                  <path class="animate-pulse" d="M0,65 Q30,65 60,65 T100,52 T140,82 T175,20 T210,108 T245,14 T280,112 T310,58 T340,65" fill="none" id="bio-pulse-harmonic" stroke="#feb956" stroke-linecap="round" stroke-width="3"></path>
                  <path d="M0,65 Q35,65 70,65 T110,61 T145,72 T178,42 T212,88 T248,34 T282,92 T315,63 T340,65" fill="none" stroke="#ffddb4" stroke-linecap="round" stroke-opacity="0.9" stroke-width="1.2"></path>
                  <!-- Sonogram Spectral Vertical Bars in Center Stage -->
                  <g opacity="0.35">
                    <line stroke="#c9ead7" stroke-dasharray="2 3" stroke-width="2" x1="165" x2="165" y1="36" y2="94"></line>
                    <line stroke="#c9ead7" stroke-dasharray="2 3" stroke-width="2" x1="180" x2="180" y1="22" y2="108"></line>
                    <line stroke="#c9ead7" stroke-dasharray="2 3" stroke-width="2" x1="195" x2="195" y1="32" y2="98"></line>
                    <line stroke="#feb956" stroke-dasharray="3 3" stroke-width="2" x1="225" x2="225" y1="26" y2="104"></line>
                    <line stroke="#feb956" stroke-dasharray="3 3" stroke-width="2.5" x1="242" x2="242" y1="16" y2="114"></line>
                    <line stroke="#feb956" stroke-dasharray="3 3" stroke-width="2" x1="260" x2="260" y1="28" y2="102"></line>
                  </g>
                  <!-- Target Isolation Box indicating classified burst -->
                  <rect fill="none" height="110" rx="8" stroke="#feb956" stroke-dasharray="4 4" stroke-opacity="0.6" stroke-width="1" width="135" x="155" y="10"></rect>
                </svg>
                <!-- Realtime Audio Target Reticle -->
                <div class="absolute right-12 top-2 bg-obsidian-scrim px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-ping"></span>
                  <span class="font-label-sm text-label-sm text-tertiary-fixed font-mono tracking-wider">CAPTURE 03.4s</span>
                </div>
              </div>
              <!-- Field Guidance Callout -->
              <p class="font-body-sm text-body-sm text-primary-fixed mt-1 text-center font-medium">
                Hold still for a few seconds. Listening to canopy and brush.
              </p>
            </div>

            <!-- Spectrogram Scale & Frequency Anchors -->
            <div class="relative z-10 flex items-center justify-between text-on-primary-container font-label-sm text-label-sm font-mono pt-1">
              <span>0 Hz</span>
              <span class="text-tertiary-fixed-dim font-bold">▲ 2.4 kHz (DOMINANT PEAK)</span>
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
                    FAUNA IDENTIFIED · PASS 04
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

        <!-- Field Controls & Archival Action Strip -->
        <div class="px-margin mt-space-md flex flex-col gap-space-sm">
          <!-- Action Trigger (48px primary button) -->
          <button class="w-full h-12 rounded-lg bg-primary-container text-vellum-bg font-title-md text-title-md flex items-center justify-center gap-2 shadow-md active:bg-secondary active:scale-[0.99] transition-all cursor-pointer" id="addJournalBtn">
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
              <span class="font-label-sm text-label-sm uppercase font-bold tracking-wider">Local Audio AI · On-Device Whisper</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const addBtn = this.container.querySelector('#addJournalBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const originalContent = addBtn.innerHTML;
        addBtn.classList.add('bg-secondary');
        addBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>RECORD ARCHIVED (#18)</span>';
        setTimeout(() => {
          addBtn.innerHTML = originalContent;
          addBtn.classList.remove('bg-secondary');
          this.onAddToJournal();
        }, 1200);
      });
    }

    const relistenBtn = this.container.querySelector('#relistenBtn');
    relistenBtn?.addEventListener('click', () => {
      // Play brief synthesized naturalist tone
      this.playSyntheticChirp();
    });
  }

  private playSyntheticChirp(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(3600, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.36);
    } catch (e) {
      console.warn('AudioContext not allowed or unavailable:', e);
    }
  }
}
