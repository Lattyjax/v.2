'use client'

import { providerConfig } from '../config/providerConfig'
import type { ProviderKey, ConnectionDraft } from '../types'

export default function ProviderForm({
  provider,
  draft,
  updateField,
  saveConnection,
  saving,
}: {
  provider: ProviderKey
  draft: ConnectionDraft
  updateField: (provider: ProviderKey, field: keyof ConnectionDraft, value: string) => void
  saveConnection: (provider: ProviderKey) => void
  saving: boolean
}) {
  return (
    <>
      <div className="grid gap-4 mt-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account Name
          </label>
          <input
            value={draft.accountName}
            onChange={(e) => updateField(provider, 'accountName', e.target.value)}
            placeholder="Page or profile name"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-[#C9A25F] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account ID / Page ID
          </label>
          <input
            value={draft.externalId}
            onChange={(e) => updateField(provider, 'externalId', e.target.value)}
            placeholder="External ID or page ID"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-[#C9A25F] focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Access Token
          </label>
          <textarea
            rows={2}
            value={draft.accessToken}
            onChange={(e) => updateField(provider, 'accessToken', e.target.value)}
            placeholder="Paste the provider access token here"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-[#C9A25F] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Refresh Token
          </label>
          <input
            value={draft.refreshToken}
            onChange={(e) => updateField(provider, 'refreshToken', e.target.value)}
            placeholder="Optional refresh token"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-[#C9A25F] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Token Expires At
          </label>
          <input
            type="datetime-local"
            value={draft.tokenExpiresAt}
            onChange={(e) => updateField(provider, 'tokenExpiresAt', e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-[#C9A25F] focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Metadata
          </label>
          <textarea
            rows={3}
            value={draft.metadata}
            onChange={(e) => updateField(provider, 'metadata', e.target.value)}
            placeholder='Optional JSON metadata, e.g. {"imageUrl":"https://example.com/image.jpg"}'
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-[#C9A25F] focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {provider === 'facebook' && (
          <a
            href="/api/social/facebook/connect"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Connect with Facebook
          </a>
        )}

        <button
          onClick={() => saveConnection(provider)}
          disabled={saving}
          className="rounded-xl bg-[#C9A25F] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          Save {providerConfig[provider].label} Manually
        </button>

        <div className="text-xs text-slate-400">
          {provider === 'instagram'
            ? 'Instagram requires a business account and an image URL in metadata.imageUrl.'
            : provider === 'linkedin'
            ? 'LinkedIn tokens must be generated via OAuth.'
            : provider === 'facebook'
            ? 'Use Connect with Facebook for OAuth, or paste tokens manually.'
            : 'Twitter requires a bearer token or OAuth2 user token.'}
        </div>
      </div>
    </>
  )
}
