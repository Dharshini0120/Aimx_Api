/**
 * Security Headers Configuration
 * OWASP Compliant security headers for web application security
 */

import { getCSPHeader } from './csp-config';

export interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Get all OWASP compliant security headers
 */
export function getSecurityHeaders(): SecurityHeaders {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    // Content Security Policy - Primary defense against XSS
    'Content-Security-Policy': getCSPHeader(),
    
    // X-Frame-Options - Prevent clickjacking attacks
    'X-Frame-Options': 'DENY',
    
    // X-Content-Type-Options - Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // X-XSS-Protection - Enable XSS filtering (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer-Policy - Control referrer information leakage
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions-Policy - Control browser features access
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'gamepad=()',
      'midi=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'speaker-selection=()',
      'web-share=()',
      'xr-spatial-tracking=()'
    ].join(', '),
    
    // Strict-Transport-Security - Force HTTPS (only in production)
    ...(isProduction && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }),
    
    // Cross-Origin-Embedder-Policy - Control cross-origin embedding
    'Cross-Origin-Embedder-Policy': 'credentialless',
    
    // Cross-Origin-Opener-Policy - Control cross-origin window access
    'Cross-Origin-Opener-Policy': 'same-origin',
    
    // Cross-Origin-Resource-Policy - Control cross-origin resource access
    'Cross-Origin-Resource-Policy': 'same-origin',
    
    // Cache-Control for security-sensitive responses
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    
    // Pragma for HTTP/1.0 compatibility
    'Pragma': 'no-cache',
    
    // Expires header
    'Expires': '0',
    
    // X-Permitted-Cross-Domain-Policies - Control Flash/PDF cross-domain access
    'X-Permitted-Cross-Domain-Policies': 'none',
    
    // X-Download-Options - Prevent file downloads from opening directly
    'X-Download-Options': 'noopen',
    
    // X-DNS-Prefetch-Control - Control DNS prefetching
    'X-DNS-Prefetch-Control': 'off'
  };
}

/**
 * Get security headers for API responses
 */
export function getAPISecurityHeaders(): SecurityHeaders {
  return {
    'Content-Security-Policy': "default-src 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

/**
 * Get security headers for static assets
 */
export function getStaticAssetHeaders(): SecurityHeaders {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cache-Control': 'public, max-age=31536000, immutable'
  };
}

/**
 * Apply security headers to Next.js response
 */
export function applySecurityHeaders(headers: Headers): void {
  const securityHeaders = getSecurityHeaders();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
}

/**
 * Security headers for different content types
 */
export const CONTENT_TYPE_HEADERS = {
  html: {
    'Content-Type': 'text/html; charset=utf-8',
    ...getSecurityHeaders()
  },
  json: {
    'Content-Type': 'application/json; charset=utf-8',
    ...getAPISecurityHeaders()
  },
  css: {
    'Content-Type': 'text/css; charset=utf-8',
    ...getStaticAssetHeaders()
  },
  js: {
    'Content-Type': 'application/javascript; charset=utf-8',
    ...getStaticAssetHeaders()
  },
  image: {
    ...getStaticAssetHeaders()
  }
};

/**
 * Validate CSP header for common issues
 */
export function validateCSP(csp: string): string[] {
  const issues: string[] = [];
  
  // Check for unsafe directives
  if (csp.includes("'unsafe-inline'") && process.env.NODE_ENV === 'production') {
    issues.push("WARNING: 'unsafe-inline' detected in production CSP");
  }
  
  if (csp.includes("'unsafe-eval'") && process.env.NODE_ENV === 'production') {
    issues.push("WARNING: 'unsafe-eval' detected in production CSP");
  }
  
  // Check for wildcard sources
  if (csp.includes('*') && !csp.includes('data:') && !csp.includes('blob:')) {
    issues.push("WARNING: Wildcard (*) source detected in CSP");
  }
  
  // Check for missing important directives
  const requiredDirectives = ['default-src', 'script-src', 'object-src', 'base-uri'];
  requiredDirectives.forEach(directive => {
    if (!csp.includes(directive)) {
      issues.push(`ERROR: Missing required directive: ${directive}`);
    }
  });
  
  return issues;
}
