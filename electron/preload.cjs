// All of the Node.js APIs are available in the preload process.
// Using CommonJS (.cjs) so Electron's require() works in renderer.

// Minimal, focused change: force light theme as early as possible so
// the packaged app doesn't flash or render using dark mode.
try {
  if (typeof document !== 'undefined' && document.documentElement) {
    // Force data-theme attribute and remove any dark class
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    // Also hint the browser about color scheme
    document.documentElement.style.colorScheme = 'light';
    if (document.body) {
      document.body.style.backgroundColor = '#F3F4F6';
      document.body.style.color = '#1F2937';
    }
  }
} catch (e) {
  // Don't crash the preload; this is a best-effort override.
}

// Keep a DOMContentLoaded listener available for future exposures.
window.addEventListener('DOMContentLoaded', () => {
  // You can expose specific Node.js functionality to your React app here
  // in a secure way if needed in the future.
});
