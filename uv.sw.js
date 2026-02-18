/* Eternity Proxy - Service Worker Wrapper */
if (typeof importScripts === 'function') {
    // Import the required Ultraviolet scripts
    // We import the bundle and config first
    importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3.2.5/dist/uv.bundle.js');
    importScripts('/uv.config.js');
    // Then we import the ACTUAL service worker logic from the CDN
    importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3.2.5/dist/uv.sw.js');
}