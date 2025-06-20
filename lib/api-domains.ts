/**
 * API Domains Configuration
 * Extracts API domains from environment variables for CSP configuration
 */

/**
 * Extract unique domains from API URLs
 */
function extractDomainsFromUrls(urls: (string | undefined)[]): string[] {
  const domains = new Set<string>();
  
  urls.forEach(url => {
    if (url) {
      try {
        const urlObj = new URL(url);
        // Add the full origin (protocol + hostname + port)
        domains.add(urlObj.origin);
      } catch (error) {
        console.warn(`Invalid URL in environment variables: ${url}`);
        console.error(error);
      }
    }
  });
  
  return Array.from(domains);
}

/**
 * Get all API domains from environment variables
 */
export function getAPIDomains(): string[] {
  const apiUrls = [
    process.env.NEXT_PUBLIC_IDENTITY_API_BASE_URL,
    process.env.NEXT_PUBLIC_DATASET_BASE_URL,
    process.env.NEXT_PUBLIC_USER_BASE_URL,
    process.env.NEXT_PUBLIC_REQUEST_BASE_URL,
    process.env.NEXT_PUBLIC_AUDIT_API_BASE_URL,
    process.env.NEXT_PUBLIC_DES_API_BASE_URL,
    process.env.NEXT_PUBLIC_PROFILE_API_BASE_URL,
    process.env.NEXT_PUBLIC_ROLE_BASE_URL,
    process.env.NEXT_PUBLIC_REQUEST_UPD_URL,
    process.env.NEXT_PUBLIC_KAFKA_BASE_URL,
    process.env.NEXT_PUBLIC_DES_BASE_URL, // Legacy support
  ];
  
  return extractDomainsFromUrls(apiUrls);
}

/**
 * Get CSP-safe connect-src directive with API domains
 */
export function getConnectSrcDirective(isProduction: boolean = false): string[] {
  const baseDomains = [
    "'self'",
    "https://api.github.com",
    "https://www.gstatic.com",
    "https://firebaseinstallations.googleapis.com",
    "https://fcmregistrations.googleapis.com",
    "https://firebase.googleapis.com"
  ];
  
  // Add API domains
  const apiDomains = getAPIDomains();
  baseDomains.push(...apiDomains);
  
  // Add WebSocket support
  if (isProduction) {
    baseDomains.push("wss:");
  } else {
    baseDomains.push("wss:", "ws:", "localhost:*", "127.0.0.1:*");
  }
  
  return baseDomains;
}

/**
 * Log API domains for debugging
 */
export function logAPIDomains(): void {
  const domains = getAPIDomains();
  console.log('🔗 API Domains configured for CSP:', domains);
}

// Auto-log in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    logAPIDomains();
  }, 1000);
}
