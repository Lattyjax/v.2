import type { SocialConnection } from '../types'

export default function TokenStatus({
  connection,
  tokenStatus,
}: {
  connection: SocialConnection
  tokenStatus: Record<string, { valid: boolean; daysLeft: number | null }>
}) {
  const status = tokenStatus[connection.id]
  if (!status) return null

  return (
    <div
      className={`mt-3 text-xs px-3 py-2 rounded-lg ${
        status.valid
          ? status.daysLeft !== null && status.daysLeft < 7
            ? 'bg-amber-500/10 text-amber-300'
            : 'bg-emerald-500/10 text-emerald-300'
          : 'bg-red-500/10 text-red-300'
      }`}
    >
      {status.valid
        ? status.daysLeft !== null
          ? `Token valid — expires in ${status.daysLeft} day(s)`
          : 'Token valid'
        : 'Token invalid or expired — please reconnect'}
    </div>
  )
}
