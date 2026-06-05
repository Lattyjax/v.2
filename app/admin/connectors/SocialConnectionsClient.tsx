'use client'

import { useMemo, useState, useEffect } from 'react'

type ProviderKey = 'linkedin' | 'facebook' | 'instagram' | 'twitter'

interface ConnectionDraft {
  accountName: string
  externalId: string
  accessToken: string
  refreshToken: string
  tokenExpiresAt: string
  metadata: string
}

interface SocialConnection {
  id: string
  provider: ProviderKey
  accountName?: string
  externalId?: string
  accessToken?: string
  refreshToken?: string
  tokenExpiresAt?: string | null
  metadata?: any
  status?: string
  updatedAt: string
}

const providerConfig: Record<
  ProviderKey,
  { label: string; description: string }
> = {
  linkedin: {
    label: 'LinkedIn',
    description: 'Publish text posts and page updates directly to LinkedIn.',
  },
  facebook: {
    label: 'Facebook',
    description: 'Publish page posts to Facebook Business pages.',
  },
  instagram: {
    label: 'Instagram',
    description: 'Publish Instagram business posts with image captions.',
  },
  twitter: {
    label: 'Twitter',
    description: 'Publish tweets using a connected Twitter account.',
  },
}

export default function SocialConnectionsClient({
  initialConnections,
}: {
  initialConnections: SocialConnection[]
}) {
  const [connections, setConnections] =
    useState<SocialConnection[]>(initialConnections)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [tokenStatus, setTokenStatus] = useState<
    Record<string, { valid: boolean; daysLeft: number | null }>
  >({})

  // Handle OAuth redirect flash messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fbSuccess = params.get('fb_success')
    const fbError = params.get('fb_error')

    if (fbSuccess) {
      setMessage(`Facebook connected: ${fbSuccess}`)
      window.history.replaceState({}, '', window.location.pathname)
    } else if (fbError) {
      setMessage(`Facebook connection failed: ${fbError}`)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Validate Facebook tokens
  useEffect(() => {
    const fbConnections = connections.filter(
      (c) => c.provider === 'facebook' && c.externalId
    )

    fbConnections.forEach((conn) => {
      fetch(`/api/social/facebook/validate?pageId=${conn.externalId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ok !== false) {
            setTokenStatus((prev) => ({
              ...prev,
              [conn.id]: {
                valid: data.valid,
                daysLeft: data.daysUntilExpiry,
              },
            }))
          }
        })
        .catch(() => {})
    })
  }, [connections])

  // Build drafts from existing connections
  const drafts = useMemo(() => {
    const result: Record<ProviderKey, ConnectionDraft> = {
      linkedin: {
        accountName: '',
        externalId: '',
        accessToken: '',
        refreshToken: '',
        tokenExpiresAt: '',
        metadata: '',
      },
      facebook: {
        accountName: '',
        externalId: '',
        accessToken: '',
        refreshToken: '',
        tokenExpiresAt: '',
        metadata: '',
      },
      instagram: {
        accountName: '',
        externalId: '',
        accessToken: '',
        refreshToken: '',
        tokenExpiresAt: '',
        metadata: '',
      },
      twitter: {
        accountName: '',
        externalId: '',
        accessToken: '',
        refreshToken: '',
        tokenExpiresAt: '',
        metadata: '',
      },
    }

    for (const provider of Object.keys(providerConfig) as ProviderKey[]) {
      const existing = connections.find((c) => c.provider === provider)
      if (existing) {
        result[provider] = {
          accountName: existing.accountName ?? '',
          externalId: existing.externalId ?? '',
          accessToken: existing.accessToken ?? '',
          refreshToken: existing.refreshToken ?? '',
          tokenExpiresAt: existing.tokenExpiresAt
            ? new Date(existing.tokenExpiresAt).toISOString().slice(0, 16)
            : '',
          metadata: existing.metadata
            ? JSON.stringify(existing.metadata, null, 2)
            : '',
        }
      }
    }

    return result
  }, [connections])

  const [formState, setFormState] =
    useState<Record<ProviderKey, ConnectionDraft>>(drafts)

  const updateField = (
    provider: ProviderKey,
    field: keyof ConnectionDraft,
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }))
  }

  const saveConnection = async (provider: ProviderKey) => {
    setSaving(true)
    setMessage(null)

    const draft = formState[provider]

    try {
      const response = await fetch('/api/admin/social-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          accountName: draft.accountName,
          externalId: draft.externalId,
          accessToken: draft.accessToken,
          refreshToken: draft.refreshToken,
          tokenExpiresAt: draft.tokenExpiresAt || undefined,
          metadata: draft.metadata ? JSON.parse(draft.metadata) : undefined,
          status: 'connected',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save connection')
      }

      setConnections((current) => {
        const updated = current.filter((c) => c.provider !== provider)
        return [...updated, data.connection]
      })

      setMessage(`${providerConfig[provider].label} connection saved.`)
    } catch (err) {
      setMessage(
        `Failed to save ${providerConfig[provider].label} connection: ${String(
          err
        )}`
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 mt-6">
      {message && (
        <div className="rounded-xl border border-white/10 bg-[#C9A25F]/10 px-4 py-3 text-sm text-[#E1C87E]">
          {message}
        </div>
      )}

      {(Object.keys(providerConfig) as ProviderKey[]).map((provider) => {
        const existing = connections.find((c) => c.provider === provider)
        const draft = formState[provider]

        return (
          <div
            key={provider}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C9A25F]/10 text-[#C9A25F] text-lg font-bold">
                  {providerConfig[provider].label[0]}
                </span>
                <div>
                  <h3 className="text-white font-semibold">
                    {providerConfig[provider].label}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {providerConfig[provider].description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    existing
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}
                >
                  {existing ? 'Connected' : 'Not connected'}
                </span>

                {existing?.updatedAt && (
                  <span className="px-3 py-1 rounded-full text-xs text-slate-400 bg-white/5">
                    Updated {new Date(existing.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="grid gap-4 mt-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Account Name
                </label>
                <input
                  value={draft.accountName}
                  onChange={(e) =>
                    updateField(provider, 'accountName', e.target.value)
                  }
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
                  onChange={(e) =>
                    updateField(provider, 'externalId', e.target.value)
                  }
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
                  onChange={(e) =>
                    updateField(provider, 'accessToken', e.target.value)
                  }
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
                  onChange={(e) =>
                    updateField(provider, 'refreshToken', e.target.value)
                  }
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
                  onChange={(e) =>
                    updateField(provider, 'tokenExpiresAt', e.target.value)
                  }
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
                  onChange={(e) =>
                    updateField(provider, 'metadata', e.target.value)
                  }
                  placeholder='Optional JSON metadata, e.g. {"imageUrl":"https://example.com/image.jpg"}'
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-[#C9A25F] focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
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

            {/* Token Status */}
            {provider === 'facebook' &&
              existing &&
              tokenStatus[existing.id] && (
                <div
                  className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                    tokenStatus[existing.id].valid
                      ? tokenStatus[existing.id].daysLeft !== null &&
                        tokenStatus[existing.id].daysLeft! < 7
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-red-500/10 text-red-300'
                  }`}
                >
                  {tokenStatus[existing.id].valid
                    ? tokenStatus[existing.id].daysLeft !== null
                      ? `Token valid — expires in ${tokenStatus[existing.id].daysLeft} day(s)`
                      : 'Token valid'
                    : 'Token invalid or expired — please reconnect'}
                </div>
              )}
          </div>
        )
      })}
    </div>
  )
}
