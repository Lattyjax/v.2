import { prisma } from '@/lib/prisma'
import PageHeader from '../_components/PageHeader'
import SocialConnectionsClient from './SocialConnectionsClient'

export const dynamic = 'force-dynamic'

function formatDate(value?: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
}

export default async function IntegrationsPage() {
  const socialConnectionModel = (prisma as any).socialConnection
  const connections: any[] = socialConnectionModel
    ? await socialConnectionModel.findMany({ orderBy: { provider: 'asc', updatedAt: 'desc' } })
    : []

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="System"
        title="Integrations"
        description="Connect and manage social media accounts for real publishing."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-bold text-white">Social Publishing Connections</h2>
            <p className="mt-3 text-sm text-slate-400">
              Connect your social accounts so the content scheduler can publish posts directly from the Hub.
              Enter the access tokens and IDs below, then schedule content from the Content Creator and Schedule pages.
            </p>
            <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">What you need for each provider</p>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <strong>LinkedIn:</strong> app access token, optional refresh token, and account ID or author URN.
                </li>
                <li>
                  <strong>Facebook:</strong> page access token and page ID for the page you want to publish to.
                </li>
                <li>
                  <strong>Instagram:</strong> Instagram business account ID, Facebook page access token, and a media image URL.
                </li>
                <li>
                  <strong>Twitter:</strong> OAuth2 bearer token or user access token for the connected Twitter app.
                </li>
              </ul>
            </div>
          </div>

          <SocialConnectionsClient initialConnections={connections.map((connection) => ({
            ...connection,
            tokenExpiresAt: connection.tokenExpiresAt ? connection.tokenExpiresAt.toISOString() : null,
          }))} />
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold text-white">Connection Status</h3>
            <div className="mt-5 space-y-4">
              {connections.length === 0 ? (
                <p className="text-slate-400">No social connections found yet. Save a connection above to begin publishing.</p>
              ) : (
                connections.map((connection) => (
                  <div key={connection.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-white">{connection.provider}</p>
                    <p className="text-xs text-slate-400">{connection.accountName || 'Unnamed account'}</p>
                    <p className="mt-2 text-xs text-slate-400">Updated {formatDate(connection.updatedAt)}</p>
                    <p className="mt-1 text-xs text-slate-400">{connection.status || 'connected'}</p>
                    {connection.tokenExpiresAt ? <p className="mt-1 text-xs text-amber-300">Expires {formatDate(new Date(connection.tokenExpiresAt))}</p> : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8">
            <h3 className="text-lg font-semibold text-white">How to link your account</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p>
                Create a developer app for each network, then paste the generated access token and the platform page/account ID here.
              </p>
              <p>
                For <strong>Facebook / Instagram</strong>, use a Facebook Page access token and the corresponding Page or Instagram Business ID.
              </p>
              <p>
                For <strong>LinkedIn</strong>, use an authorized user token and the member or organization URN as the external account identifier.
              </p>
              <p>
                For <strong>Twitter</strong>, use your app token with write permissions to publish tweets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
