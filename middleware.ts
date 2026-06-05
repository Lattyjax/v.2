import { withAuth } from 'next-auth/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// Set DISABLE_ADMIN_AUTH=true in .env.local for local/debug access without Google OAuth.
// Never set this true in production. Check is inside the handler so a misconfigured
// Vercel preview does not crash the Edge isolate at module load for all routes.
const DISABLE_AUTH = process.env.DISABLE_ADMIN_AUTH === 'true'

export default DISABLE_AUTH
  ? function bypass(_req: NextRequest) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'DISABLE_ADMIN_AUTH must not be enabled in production' },
          { status: 500 },
        )
      }
      return NextResponse.next()
    }
  : withAuth(
      function middleware(req) {
        if (req.nextUrl.pathname.startsWith('/admin')) {
          const token = req.nextauth.token
          if (!token) {
            return NextResponse.redirect(new URL('/api/auth/signin', req.url))
          }
        }
        return NextResponse.next()
      },
      {
        callbacks: {
          authorized: ({ token, req }) => {
            if (req.nextUrl.pathname.startsWith('/admin')) {
              return !!token
            }
            return true
          },
        },
      }
    )

export const config = {
  matcher: ['/admin/:path*'],
}
