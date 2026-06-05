import { useEffect, useState } from 'react'
import type { SocialConnection } from '../types'

export function useTokenValidation(connections: SocialConnection[]) {
  const [status, setStatus] = useState<
    Record<string, { valid: boolean; daysLeft: number | null }>
  >({})

  useEffect(() => {
    const fbConnections = connections.filter(
      (c) => c.provider === 'facebook' && c.externalId
    )

    fbConnections.forEach((conn) => {
      fetch(`/api/social/facebook/validate?pageId=${conn.externalId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ok !== false) {
            setStatus((prev) => ({
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

  return status
}
