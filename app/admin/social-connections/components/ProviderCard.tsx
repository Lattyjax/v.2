import ProviderForm from './ProviderForm'
import TokenStatus from './TokenStatus'
import { providerConfig } from '../config/providerConfig'
import type { ProviderKey, SocialConnection, ConnectionDraft } from '../types'

export default function ProviderCard({
  provider,
  connection,
  draft,
  updateField,
  saveConnection,
  saving,
  tokenStatus,
}: {
  provider: ProviderKey
  connection?: SocialConnection
  draft: ConnectionDraft
  updateField: (
    provider: ProviderKey,
    field: keyof ConnectionDraft,
    value: string
  ) => void
  saveConnection: (provider: ProviderKey) => void
  saving: boolean
  tokenStatus: Record<string, { valid: boolean; daysLeft: number | null }>
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
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
              connection
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'bg-slate-500/10 text-slate-400'
            }`}
          >
            {connection ? 'Connected' : 'Not connected'}
          </span>

          {connection?.updatedAt && (
            <span className="px-3 py-1 rounded-full text-xs text-slate-400 bg-white/5">
              Updated {new Date(connection.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <ProviderForm
        provider={provider}
        draft={draft}
        updateField={updateField}
        saveConnection={saveConnection}
        saving={saving}
      />

      {provider === 'facebook' && connection && (
        <TokenStatus connection={connection} tokenStatus={tokenStatus} />
      )}
    </div>
  )
}
