/**
 * WebSocket State Sync Manager
 * Handles interpolation, jitter buffering, and sequence numbers.
 */

export class SyncManager {
  constructor() {
    this.stateBuffer = []; // { timestamp, state }
    this.renderDelay = 100; // ms
    this.lastSequence = -1;
  }

  onMessage(data) {
    if (data.seq <= this.lastSequence) return; // Drop out of order
    this.lastSequence = data.seq;
    
    this.stateBuffer.push({
      timestamp: Date.now(),
      state: data.payload
    });

    // Keep buffer lean
    if (this.stateBuffer.length > 20) this.stateBuffer.shift();
  }

  getInterpolatedState() {
    const renderTime = Date.now() - this.renderDelay;
    
    // Find two states to interpolate between
    let b0 = null;
    let b1 = null;

    for (let i = 0; i < this.stateBuffer.length - 1; i++) {
      if (this.stateBuffer[i].timestamp <= renderTime && this.stateBuffer[i+1].timestamp >= renderTime) {
        b0 = this.stateBuffer[i];
        b1 = this.stateBuffer[i+1];
        break;
      }
    }

    if (!b0 || !b1) return this.stateBuffer[this.stateBuffer.length - 1]?.state;

    const t = (renderTime - b0.timestamp) / (b1.timestamp - b0.timestamp);
    return this.lerpState(b0.state, b1.state, t);
  }

  lerpState(s0, s1, t) {
    // Basic linear interpolation for x/y
    return {
      x: s0.x + (s1.x - s0.x) * t,
      y: s0.y + (s1.y - s0.y) * t
    };
  }
}
