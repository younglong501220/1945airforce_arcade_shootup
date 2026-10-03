/**
 * 1945 Retro Arcade Web Audio Synthesizer Engine
 * Enhanced with Weapon sounds (Laser, Missile, Rocket) and Active Skills FX
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;

  constructor() {
    // Lazy initialization on first user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  private createGain(now: number, duration: number, peakVol: number): GainNode | null {
    if (!this.ctx || this.isMuted) return null;
    const gain = this.ctx.createGain();
    const effectiveVol = peakVol * this.masterVolume;
    gain.gain.setValueAtTime(effectiveVol, now);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);
    gain.connect(this.ctx.destination);
    return gain;
  }

  public playLaser(planeType: 'P51' | 'SPITFIRE' | 'P38' = 'P51') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const duration = planeType === 'SPITFIRE' ? 0.08 : 0.12;
    const gain = this.createGain(now, duration, 0.12);
    if (!gain) return;

    osc.connect(gain);

    if (planeType === 'SPITFIRE') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + duration);
    } else if (planeType === 'P38') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + duration);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + duration);
    }

    osc.start(now);
    osc.stop(now + duration);
  }

  public playBeamLaser() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const duration = 0.14;
    const gain = this.createGain(now, duration, 0.13);
    if (!gain) return;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + duration);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playMissileLaunch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const duration = 0.16;
    const gain = this.createGain(now, duration, 0.11);
    if (!gain) return;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(950, now + duration);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playRocketLaunch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const duration = 0.2;
    const gain = this.createGain(now, duration, 0.18);
    if (!gain) return;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + duration);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playSkillShield() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const duration = 0.4;
    const gain = this.createGain(now, duration, 0.25);
    if (!gain) return;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.2);
    osc.frequency.linearRampToValueAtTime(1320, now + duration);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playSkillBoost() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.35;
    const gain = this.createGain(now, duration, 0.22);
    if (!gain) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + duration);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playSkillAirStrike() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.6;
    const gain = this.createGain(now, duration, 0.35);
    if (!gain) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playEnemyShoot() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const duration = 0.09;
    const gain = this.createGain(now, duration, 0.08);
    if (!gain) return;

    osc.connect(gain);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }

  public playExplosion(isLarge: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = isLarge ? 0.45 : 0.25;
    const gain = this.createGain(now, duration, isLarge ? 0.35 : 0.2);
    if (!gain) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isLarge ? 400 : 800, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + duration);

    noise.connect(filter);
    filter.connect(gain);

    noise.start(now);
    noise.stop(now + duration);
  }

  public playBomb() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 1.3;
    const gain = this.createGain(now, duration, 0.65);
    if (!gain) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + duration);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration);

    this.playExplosion(true);
  }

  public playPowerUp(type: string) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.28;
    const gain = this.createGain(now, duration, 0.22);
    if (!gain) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.connect(gain);

    if (type === 'P' || type.startsWith('W_')) {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(640, now + 0.1);
      osc.frequency.linearRampToValueAtTime(960, now + duration);
    } else if (type === 'B') {
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(500, now + duration);
    } else if (type === 'W') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + duration);
    } else {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.linearRampToValueAtTime(1046.5, now + duration);
    }

    osc.start(now);
    osc.stop(now + duration);
  }

  public playBossAlarm() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 1.0;
    const gain = this.createGain(now, duration, 0.25);
    if (!gain) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.connect(gain);

    osc.frequency.setValueAtTime(650, now);
    osc.frequency.setValueAtTime(450, now + 0.25);
    osc.frequency.setValueAtTime(650, now + 0.5);
    osc.frequency.setValueAtTime(450, now + 0.75);

    osc.start(now);
    osc.stop(now + duration);
  }

  public playCoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.createGain(now, 0.35, 0.2);
    if (!gain) return;

    osc1.connect(gain);
    osc2.connect(gain);

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(987.77, now);
    osc1.frequency.setValueAtTime(1318.51, now + 0.08);
    osc2.frequency.setValueAtTime(1318.51, now);
    osc2.frequency.setValueAtTime(1760.00, now + 0.08);

    osc1.start(now);
    osc1.stop(now + 0.35);
    osc2.start(now);
    osc2.stop(now + 0.35);
  }
}

export const sound = new SoundEngine();
