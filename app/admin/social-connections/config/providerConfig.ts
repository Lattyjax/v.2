import type { ProviderKey } from '../types'

export const providerConfig: Record<
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
