import { prisma } from '@/lib/prisma'
import type { ContentAsset, SocialProvider } from '@prisma/client'
import { decryptToken } from '@/lib/crypto'

type ProviderConnection = {
  id: string
  provider: SocialProvider
  accountName?: string | null
  externalId?: string | null
  accessToken?: string | null
  refreshToken?: string | null
  tokenExpiresAt?: Date | null
  metadata?: any
  status?: string | null
}

export async function getSocialConnection(provider: SocialProvider) {
  const socialConnectionModel = (prisma as any).socialConnection
  if (!socialConnectionModel) {
    throw new Error('SocialConnection model unavailable. Run prisma generate after schema changes.')
  }

  return socialConnectionModel.findFirst({
    where: { provider },
    orderBy: { updatedAt: 'desc' },
  }) as Promise<ProviderConnection | null>
}

export async function publishSocialPost(asset: ContentAsset) {
  if (!asset.channel) {
    throw new Error('Content asset channel is missing')
  }

  const provider = asset.channel as SocialProvider
  const raw = await getSocialConnection(provider)
  if (!raw || !raw.accessToken) {
    throw new Error(`No connected ${provider} account found. Please connect a ${provider} account in Integrations.`)
  }

  // Decrypt stored tokens before use
  const connection: ProviderConnection = {
    ...raw,
    accessToken: decryptToken(raw.accessToken),
    refreshToken: decryptToken(raw.refreshToken),
  }

  switch (provider) {
    case 'linkedin':
      return publishLinkedIn(asset, connection)
    case 'facebook':
      return publishFacebookPage(asset, connection)
    case 'instagram':
      return publishInstagram(asset, connection)
    case 'twitter':
      return publishTwitter(asset, connection)
    default:
      throw new Error(`Unsupported social provider: ${provider}`)
  }
}

async function publishLinkedIn(asset: ContentAsset, connection: ProviderConnection) {
  const token = connection.accessToken
  let authorUrn = connection.externalId

  if (!authorUrn) {
    const profile = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!profile.ok) {
      throw new Error('Unable to fetch LinkedIn profile for publish.')
    }

    const profileData = await profile.json()
    authorUrn = `urn:li:person:${profileData.id}`
  }

  const payload = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: asset.bodyText ?? asset.title,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-RestLi-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`LinkedIn publish failed: ${response.status} ${errorBody}`)
  }

  const result = await response.json()
  return { success: true, providerId: result.id ?? null }
}

async function publishFacebookPage(asset: ContentAsset, connection: ProviderConnection) {
  const pageId = connection.externalId
  if (!pageId) throw new Error('Facebook page ID / externalId is required to publish.')

  // Warn if token is expiring within 7 days but still proceed
  if (connection.tokenExpiresAt) {
    const daysLeft = (connection.tokenExpiresAt.getTime() - Date.now()) / 86_400_000
    if (daysLeft < 0) throw new Error('Facebook page access token has expired. Re-connect in Integrations.')
  }

  const token = connection.accessToken as string
  const meta = connection.metadata as Record<string, unknown> | null

  // Photo post: asset carries an imageUrl in metadata
  const imageUrl = (meta?.imageUrl as string | undefined) ?? (asset as any).imageUrl
  if (imageUrl) {
    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: imageUrl,
        caption: asset.bodyText ?? asset.title,
        access_token: token,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Facebook photo publish failed: ${res.status} ${body}`)
    }
    const result = await res.json()
    return { success: true, providerId: result.post_id ?? result.id ?? null }
  }

  // Link post: asset carries a linkUrl
  const linkUrl = (asset as any).linkUrl as string | undefined

  const payload: Record<string, string> = {
    message: asset.bodyText ?? asset.title ?? '',
    access_token: token,
  }
  if (linkUrl) payload.link = linkUrl

  // Scheduled publishing: asset.scheduledAt must be at least 10 min in the future
  const scheduledAt = (asset as any).scheduledAt as Date | string | undefined
  if (scheduledAt) {
    const ts = Math.floor(new Date(scheduledAt).getTime() / 1000)
    if (ts > Math.floor(Date.now() / 1000) + 600) {
      payload.scheduled_publish_time = String(ts)
      payload.published = 'false'
    }
  }

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Facebook publish failed: ${res.status} ${body}`)
  }

  const result = await res.json()
  return { success: true, providerId: result.id ?? null }
}

async function publishInstagram(asset: ContentAsset, connection: ProviderConnection) {
  const token = connection.accessToken
  const instagramId = connection.externalId
  const imageUrl = connection.metadata?.imageUrl as string | undefined

  if (!instagramId) {
    throw new Error('Instagram business account ID is required to publish.')
  }

  if (!imageUrl) {
    throw new Error('Instagram publishing requires an image URL. Add metadata.imageUrl when connecting Instagram.')
  }

  const createResponse = await fetch(`https://graph.facebook.com/v19.0/${instagramId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: asset.bodyText ?? asset.title,
      access_token: token,
    }),
  })

  if (!createResponse.ok) {
    const errorBody = await createResponse.text()
    throw new Error(`Instagram media creation failed: ${createResponse.status} ${errorBody}`)
  }

  const createResult = await createResponse.json()
  const creationId = createResult.id
  if (!creationId) {
    throw new Error('Instagram media creation returned no creation id.')
  }

  const publishResponse = await fetch(`https://graph.facebook.com/v19.0/${instagramId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: token,
    }),
  })

  if (!publishResponse.ok) {
    const errorBody = await publishResponse.text()
    throw new Error(`Instagram publish failed: ${publishResponse.status} ${errorBody}`)
  }

  const publishResult = await publishResponse.json()
  return { success: true, providerId: publishResult.id ?? null }
}

async function publishTwitter(asset: ContentAsset, connection: ProviderConnection) {
  const token = connection.accessToken

  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: asset.bodyText ?? asset.title }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Twitter publish failed: ${response.status} ${errorBody}`)
  }

  const result = await response.json()
  return { success: true, providerId: result.data?.id ?? null }
}
