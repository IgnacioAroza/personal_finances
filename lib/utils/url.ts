/**
 * Utility function to get the correct base URL for the application
 * Works in both development and production environments
 */
export function getBaseUrl(): string {
  // Browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server environment
  // Check for Vercel environment variables (production)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Check for custom domain in Vercel
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Fallback for development
  return 'http://localhost:3000'
}

/**
 * Get the callback URL for OAuth redirects
 */
export function getCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`
}
