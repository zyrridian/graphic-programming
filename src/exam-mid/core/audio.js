export class AudioManager {
  constructor(config) {
    this.config = config;
    this.audioContext = null;
    this.ambientStarted = false;

    this.ambientTrack = new Audio(config.audio.ambientPath);
    this.ambientTrack.loop = true;
    this.ambientTrack.volume = config.audio.ambientVolume;
    this.ambientTrack.preload = "auto";
  }

  ensureReady() {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    if (!this.ambientStarted) {
      this.ambientTrack.currentTime = 0;
      this.ambientTrack.play().catch(() => {});
      this.ambientStarted = true;
    }
  }

  playGunfire() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const sampleRate = this.audioContext.sampleRate;
    const length = Math.floor(sampleRate * 0.14);

    const noiseBuffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.2);
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(650, now);

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.2, now + 0.003);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.14);

    const boom = this.audioContext.createOscillator();
    boom.type = "triangle";
    boom.frequency.setValueAtTime(180, now);
    boom.frequency.exponentialRampToValueAtTime(50, now + 0.11);

    const boomGain = this.audioContext.createGain();
    boomGain.gain.setValueAtTime(0.075, now);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    boom.connect(boomGain);
    boomGain.connect(this.audioContext.destination);

    boom.start(now);
    boom.stop(now + 0.11);
  }

  playJump() {
    this.playTone({
      frequency: 260,
      duration: 0.1,
      type: "square",
      gain: 0.035,
      decay: 0.08,
    });
  }

  playLanding() {
    this.playTone({
      frequency: 120,
      duration: 0.08,
      type: "triangle",
      gain: 0.03,
      decay: 0.06,
    });
  }

  playFootstep(speedFactor) {
    this.playTone({
      frequency: 90 + Math.random() * 25 + speedFactor * 10,
      duration: 0.05,
      type: "sine",
      gain: 0.012,
      decay: 0.045,
    });
  }

  playTone({ frequency, duration, type, gain, decay }) {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}
