export type ProviderKey = 'linkedin' | 'facebook' | 'instagram' | 'twitter'

export interface ConnectionDraft {
  accountName: string
  externalId: string
  accessToken: string
  refreshToken: string
  tokenExpiresAt: string
  metadata: string
}

export interface SocialConnection {
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
