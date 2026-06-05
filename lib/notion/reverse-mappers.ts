import type { PipelineStage } from '@prisma/client'

// Notion Status name → PipelineStage
// Mirrors the forward mapping in mappers.ts (mapPipelineStage)
export function reverseMapPipelineStage(notionStatus: string): PipelineStage | null {
  const m: Record<string, PipelineStage> = {
    Lead: 'New',
    Negotiating: 'Qualified',
    Active: 'Sold',
    Lost: 'Lost',
  }
  return m[notionStatus] ?? null
}
