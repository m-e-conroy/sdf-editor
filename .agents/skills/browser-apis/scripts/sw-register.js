/**
 * Service Worker Registration & Update Management
 */

export function registerServiceWorker(swPath = '/sw.js') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register(swPath);
        console.log('SW registered:', registration.scope);

        // Handle updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;
          
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content available; please refresh.');
                // Trigger UI alert here
              } else {
                console.log('Content is cached for offline use.');
              }
            }
          };
        };
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    });
  }
}
