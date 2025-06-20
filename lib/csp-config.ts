/**
 * Content Security Policy Configuration
 * OWASP Compliant CSP settings for different environments
 */

export interface CSPConfig {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'font-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'upgrade-insecure-requests': boolean;
  'block-all-mixed-content': boolean;
}

// Development CSP - More permissive for development tools
export const developmentCSP: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js dev mode
    "'unsafe-eval'", // Required for Next.js dev mode and React DevTools
    "https://www.gstatic.com",
    "https://apis.google.com",
    "https://www.google.com",
    "https://www.googletagmanager.com",
    "https://connect.facebook.net",
    "https://www.facebook.com",
    "localhost:*", // Allow localhost for development
    "127.0.0.1:*"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and CSS-in-JS
    "https://fonts.googleapis.com",
    "https://www.gstatic.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "http:", // Allow HTTP images in development
    "localhost:*",
    "127.0.0.1:*"
  ],
  'connect-src': [
    "'self'",
    "https://api.github.com",
    "https://www.gstatic.com",
    "https://firebaseinstallations.googleapis.com",
    "https://fcmregistrations.googleapis.com",
    "https://firebase.googleapis.com",
    "http://13.229.196.7:8000", // API server
    "http://13.229.196.7:8089", // Notification server
    "wss:",
    "ws:", // Allow WebSocket connections for dev server
    "localhost:*",
    "127.0.0.1:*"
  ],
  'frame-src': [
    "'self'",
    "https://www.google.com",
    "https://www.facebook.com"
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': false, // Disabled in development
  'block-all-mixed-content': false
};

// Production CSP - Strict security for production
export const productionCSP: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Remove unsafe-inline and unsafe-eval for production
    "https://www.gstatic.com",
    "https://apis.google.com",
    "https://www.google.com",
    "https://www.googletagmanager.com",
    "https://connect.facebook.net",
    "https://www.facebook.com"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Still needed for some CSS-in-JS libraries
    "https://fonts.googleapis.com",
    "https://www.gstatic.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:" // Only HTTPS images in production
  ],
  'connect-src': [
    "'self'",
    "https://api.github.com",
    "https://www.gstatic.com",
    "https://firebaseinstallations.googleapis.com",
    "https://fcmregistrations.googleapis.com",
    "https://firebase.googleapis.com",
    "http://13.229.196.7:8000", // API server
    "http://13.229.196.7:8089", // Notification server
    "wss:" // Secure WebSocket only
  ],
  'frame-src': [
    "'self'",
    "https://www.google.com",
    "https://www.facebook.com"
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': true,
  'block-all-mixed-content': true
};

/**
 * Convert CSP config object to CSP header string
 */
export function buildCSPHeader(config: CSPConfig): string {
  const directives: string[] = [];

  Object.entries(config).forEach(([key, value]) => {
    if (key === 'upgrade-insecure-requests' || key === 'block-all-mixed-content') {
      if (value) {
        directives.push(key.replace(/-/g, '-'));
      }
    } else if (Array.isArray(value)) {
      directives.push(`${key} ${value.join(' ')}`);
    }
  });

  return directives.join('; ');
}

/**
 * Get CSP configuration based on environment
 */
export function getCSPConfig(): CSPConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? productionCSP : developmentCSP;
}

/**
 * Get CSP header string for current environment
 */
export function getCSPHeader(): string {
  return buildCSPHeader(getCSPConfig());
}

// Nonce generation for inline scripts (if needed)
export function generateNonce(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    return Buffer.from(window.crypto.getRandomValues(new Uint8Array(16))).toString('base64');
  } else if (typeof global !== 'undefined' && global.crypto) {
    // Node.js environment with crypto global
    return Buffer.from(global.crypto.getRandomValues(new Uint8Array(16))).toString('base64');
  } else {
    // Fallback for environments without crypto
    const array = new Uint8Array(16);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return Buffer.from(array).toString('base64');
  }
}
