export class AudioFeedback {
  private static ctx: AudioContext | null = null;

  private static getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Synthesizes an organic outdoor chime so the naturalist knows recording started/stopped
   * without needing to look at their screen.
   */
  static playTone(type: 'start' | 'stop' | 'save' | 'snapshot'): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'start') {
        // Ascending wooden bamboo chime (E5 -> A5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        this.vibrate([40]);
      } else if (type === 'stop') {
        // Descending gentle tone (A5 -> E5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        this.vibrate([60]);
      } else if (type === 'save') {
        // High harmonic double-blip
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(1046.5, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        this.vibrate([30, 40, 60]);
      } else if (type === 'snapshot') {
        // Shutter snap sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        this.vibrate([70]);
      }
    } catch (e) {
      console.warn('Audio chime unavailable:', e);
    }
  }

  static vibrate(pattern: number[]): void {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  }
}

export class FieldAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private isRecording = false;

  async start(onWaveform?: (amplitude: number) => void): Promise<void> {
    if (this.isRecording) return;

    this.audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Setup visualizer analyzer
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = ctx.createMediaStreamSource(this.audioStream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    source.connect(this.analyser);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.audioStream, { mimeType });
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250);
    this.isRecording = true;
    AudioFeedback.playTone('start');

    // Run amplitude ticker
    if (onWaveform) {
      const buffer = new Uint8Array(this.analyser.frequencyBinCount);
      const tick = () => {
        if (!this.isRecording) return;
        this.analyser?.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        const avg = sum / buffer.length / 255;
        onWaveform(avg);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  async stop(): Promise<Blob> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('Not recording');
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const finalBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioStream?.getTracks().forEach((t) => t.stop());
        this.isRecording = false;
        AudioFeedback.playTone('stop');
        resolve(finalBlob);
      };

      this.mediaRecorder!.stop();
    });
  }

  get recording(): boolean {
    return this.isRecording;
  }
}
