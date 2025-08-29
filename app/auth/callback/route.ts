import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Determine the correct base URL for redirection
      const getBaseUrl = () => {
        // Check for Vercel environment variables
        if (process.env.VERCEL_URL) {
          return `https://${process.env.VERCEL_URL}`
        }
        
        // Check for custom domain
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
          return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        }
        
        // Check forwarded host (for proxies/load balancers)
        const forwardedHost = request.headers.get('x-forwarded-host')
        const forwardedProto = request.headers.get('x-forwarded-proto')
        if (forwardedHost) {
          return `${forwardedProto || 'https'}://${forwardedHost}`
        }
        
        // Fallback to request origin
        return new URL(request.url).origin
      }

      const baseUrl = getBaseUrl()
      const redirectUrl = `${baseUrl}${next}`
      
      console.log('Redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Auth error:', error)
    }
  }

  // return the user to an error page with instructions
  const baseUrl = new URL(request.url).origin
  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`)
}
