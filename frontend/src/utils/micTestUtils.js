/**
 * Real-time microphone audio analyzer for interview pre-flight hardware checks.
 */
export class MicAudioTester {
  constructor(onLevelChange) {
    this.onLevelChange = onLevelChange;
    this.audioContext = null;
    this.mediaStream = null;
    this.animationId = null;
    this.analyser = null;
  }

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Web Audio media devices not supported in this browser.');
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    const buffer = new Uint8Array(this.analyser.frequencyBinCount);

    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i];
      }
      const avg = sum / buffer.length;
      const normalized = Math.min(100, Math.round((avg / 128) * 100));
      if (this.onLevelChange) {
        this.onLevelChange(normalized);
      }
      this.animationId = requestAnimationFrame(tick);
    };

    tick();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {
        // ignore close error
      }
      this.audioContext = null;
    }
    if (this.onLevelChange) {
      this.onLevelChange(0);
    }
  }
}
