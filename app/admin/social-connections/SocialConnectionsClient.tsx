'use client'

import { useState } from 'react'
import type { ProviderKey, SocialConnection } from './types'
import { providerConfig } from './config/providerConfig'
import { useProviderDrafts } from './hooks/useProviderDrafts'
import { useTokenValidation } from './hooks/useTokenValidation'
import ProviderCard from './components/ProviderCard'

export default function SocialConnectionsClient({
  initialConnections,
}: {
  initialConnections: SocialConnection[]
}) {
  const [connections, setConnections] = useState(initialConnections)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const { drafts, updateField } = useProviderDrafts(connections)
  const tokenStatus = useTokenValidation(connections)

  const saveConnection = async (provider: ProviderKey) => {
    setSaving(true)
    setMessage(null)

    const draft = drafts[provider]

    try {
      let parsedMetadata: unknown = undefined

      if (draft.metadata.trim()) {
        parsedMetadata = JSON.parse(draft.metadata)
      }

      const response = await fetch('/api/admin/social-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          ...draft,
          metadata: parsedMetadata,
          status: 'connected',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save connection')
      }

      setConnections((prev) => [
        ...prev.filter((c) => c.provider !== provider),
        data.connection,
      ])

      setMessage(`${providerConfig[provider].label} connection saved.`)
    } catch (err) {
      setMessage(
        `Failed to save ${providerConfig[provider].label}: ${
          err instanceof Error ? err.message : String(err)
        }`
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

      {(Object.keys(providerConfig) as ProviderKey[]).map((provider) => (
        <ProviderCard
          key={provider}
          provider={provider}
          connection={connections.find((c) => c.provider === provider)}
          draft={drafts[provider]}
          updateField={updateField}
          saveConnection={saveConnection}
          saving={saving}
          tokenStatus={tokenStatus}
        />
      ))}
    </div>
  )
}
