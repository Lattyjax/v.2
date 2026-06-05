import { useEffect, useMemo, useState } from 'react'
import type { ProviderKey, ConnectionDraft, SocialConnection } from '../types'
import { providerConfig } from '../config/providerConfig'

export function useProviderDrafts(connections: SocialConnection[]) {
  const initialDrafts = useMemo(() => {
    const base: Record<ProviderKey, ConnectionDraft> = {
      linkedin: emptyDraft(),
      facebook: emptyDraft(),
      instagram: emptyDraft(),
      twitter: emptyDraft(),
    }

    for (const provider of Object.keys(providerConfig) as ProviderKey[]) {
      const existing = connections.find((c) => c.provider === provider)

      if (existing) {
        base[provider] = {
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

    return base
  }, [connections])

  const [drafts, setDrafts] =
    useState<Record<ProviderKey, ConnectionDraft>>(initialDrafts)

  useEffect(() => {
    setDrafts(initialDrafts)
  }, [initialDrafts])

  const updateField = (
    provider: ProviderKey,
    field: keyof ConnectionDraft,
    value: string
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }))
  }

  return { drafts, updateField }
}

function emptyDraft(): ConnectionDraft {
  return {
    accountName: '',
    externalId: '',
    accessToken: '',
    refreshToken: '',
    tokenExpiresAt: '',
    metadata: '',
  }
}
