/**
 * Connectivity & Online/Offline Management
 */

export const Connectivity = {
  /**
   * Monitor online status and execute callbacks
   */
  monitor(onOnline, onOffline) {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    
    // Initial check
    if (navigator.onLine) onOnline();
    else onOffline();

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  },

  /**
   * Estimate storage quota for current origin
   */
  async getStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate();
      return {
        usageMB: (usage / (1024 * 1024)).toFixed(2),
        quotaMB: (quota / (1024 * 1024)).toFixed(2),
        percentUsed: ((usage / quota) * 100).toFixed(2)
      };
    }
    return null;
  }
};
