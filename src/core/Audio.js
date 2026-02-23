export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.lastHurtAt = -999;
    this.enabled = true;
    this.volume = 0.18;
  }

  ensureContext() {
    if (!this.enabled) return false;

    if (!this.ctx) {
      this.ctx = new window.AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return true;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  setVolume(value) {
    const v = Math.max(0, Math.min(1, Number(value)));
    this.volume = v;
    if (this.master) {
      this.master.gain.value = v;
    }
  }

  shoot() {
    if (!this.ensureContext()) return;
    const t0 = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(210, t0);
    osc.frequency.exponentialRampToValueAtTime(95, t0 + 0.06);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.09);
  }

  hit() {
    if (!this.ensureContext()) return;
    const t0 = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, t0);
    osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.07);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.1);
  }

  hurt() {
    if (!this.ensureContext()) return;
    const t0 = this.ctx.currentTime;

    if (t0 - this.lastHurtAt < 0.12) return;
    this.lastHurtAt = t0;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, t0);
    osc.frequency.exponentialRampToValueAtTime(110, t0 + 0.08);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.2, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.11);
  }

  apple() {
    if (!this.ensureContext()) return;
    const t0 = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(620, t0);
    osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.08);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.13);
  }

  bomb() {
    if (!this.ensureContext()) return;
    const t0 = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(140, t0);
    osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.2);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.26);
  }

  missileLaunch() {
    if (!this.ensureContext()) return;
    const t0 = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(260, t0);
    osc.frequency.exponentialRampToValueAtTime(520, t0 + 0.12);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.24, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.2);
  }

  missileHit() {
    if (!this.ensureContext()) return;
    const t0 = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(320, t0);
    osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.16);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.32, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.22);
  }
}
