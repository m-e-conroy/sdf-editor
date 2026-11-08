/**
 * Web Audio Manager
 * Handles pooling, spatialization, and music/sfx volume levels.
 */

export class AudioManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    
    this.buffers = new Map();
  }

  async load(name, url) {
    const resp = await fetch(url);
    const arrayBuffer = await resp.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.buffers.set(name, audioBuffer);
  }

  playSFX(name, volume = 1.0) {
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    
    source.connect(gain);
    gain.connect(this.sfxGain);
    
    source.start(0);
    return source;
  }

  playSpatialSFX(name, x, y, z, volume = 1.0) {
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const panner = this.ctx.createPanner();
    panner.positionX.value = x;
    panner.positionY.value = y;
    panner.positionZ.value = z;

    source.connect(panner);
    panner.connect(this.sfxGain);
    
    source.start(0);
  }
}
