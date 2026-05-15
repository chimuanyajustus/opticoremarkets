/**
 * Cache busting utilities for mobile and web
 * Helps ensure users get the latest build, especially on mobile
 */

export const CACHE_VERSION = 'v1.0.0-' + new Date().toISOString().split('T')[0];

export async function clearServiceWorkerCache() {
  try {
    if ('serviceWorker' in navigator) {
      console.log('[CacheBusting] Clearing service worker cache');
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        const success = await registration.unregister();
        console.log('[CacheBusting] Service worker unregistered:', success);
      }
    }
  } catch (error) {
    console.error('[CacheBusting] Error clearing service worker cache:', error);
  }
}

export async function clearBrowserCache() {
  try {
    console.log('[CacheBusting] Attempting to clear browser cache');
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('[CacheBusting] Found caches:', cacheNames);
      
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('[CacheBusting] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
      
      console.log('[CacheBusting] All caches cleared');
    }
  } catch (error) {
    console.error('[CacheBusting] Error clearing browser cache:', error);
  }
}

export async function checkAndClearStaleCache() {
  try {
    const storedVersion = localStorage.getItem('CACHE_VERSION');
    console.log('[CacheBusting] Stored cache version:', storedVersion, 'Current version:', CACHE_VERSION);
    
    if (storedVersion !== CACHE_VERSION) {
      console.log('[CacheBusting] Cache version mismatch, clearing stale cache');
      await clearBrowserCache();
      await clearServiceWorkerCache();
      localStorage.setItem('CACHE_VERSION', CACHE_VERSION);
      console.log('[CacheBusting] Cache cleared and version updated');
    }
  } catch (error) {
    console.error('[CacheBusting] Error checking/clearing cache:', error);
  }
}
