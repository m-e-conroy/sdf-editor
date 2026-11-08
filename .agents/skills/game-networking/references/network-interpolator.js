/**
 * Snapshot Interpolation Logic
 * Smooths out networked entity movement by interpolating between server states.
 */

class NetworkInterpolator {
  constructor(renderDelay = 100) {
    this.snapshots = []; // { timestamp, data }
    this.renderDelay = renderDelay; // ms
  }

  addSnapshot(timestamp, data) {
    this.snapshots.push({ timestamp, data });
    // Keep last 1 second of snapshots
    if (this.snapshots.length > 60) this.snapshots.shift();
  }

  getInterpolatedState(renderTime) {
    const targetTime = renderTime - this.renderDelay;

    // Find two snapshots to interpolate between
    let i = 0;
    while (i < this.snapshots.length - 1 && this.snapshots[i + 1].timestamp < targetTime) {
      i++;
    }

    const s1 = this.snapshots[i];
    const s2 = this.snapshots[i + 1];

    if (!s2) return s1 ? s1.data : null;

    // Linear Interpolation factor
    const t = (targetTime - s1.timestamp) / (s2.timestamp - s1.timestamp);
    
    return this.interpolate(s1.data, s2.data, t);
  }

  interpolate(d1, d2, t) {
    // Basic linear interpolation for numeric fields
    const result = {};
    for (const key in d1) {
      if (typeof d1[key] === 'number') {
        result[key] = d1[key] + (d2[key] - d1[key]) * t;
      } else {
        result[key] = d2[key]; // Snap non-numeric
      }
    }
    return result;
  }
}

export { NetworkInterpolator };
