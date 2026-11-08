/**
 * Modern Observer Utilities
 */

export const Observers = {
  /**
   * Lazy loads images when they enter viewport
   */
  lazyLoad(selector = 'img[data-src]', options = { rootMargin: '0px 0px 200px 0px' }) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    }, options);

    document.querySelectorAll(selector).forEach(img => observer.observe(img));
  },

  /**
   * Monitors element size changes without window resize events
   */
  watchSize(element, callback) {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        callback(entry.contentRect);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }
};
