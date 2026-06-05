import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { logger } from '@/lib/logger'

function parseList(v?: string | null): string[] {
  return (v ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
}

const adminEmails = parseList(process.env.ADMIN_EMAILS)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: 'consent', access_type: 'offline', response_type: 'code' } },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = (profile?.email ?? '').toLowerCase()
      const allowed = adminEmails.length > 0 && adminEmails.includes(email)
      logger.info({ email, allowed }, '[auth] signIn attempt')
      return allowed
    },
  },
  pages: { signIn: '/login' },
}
