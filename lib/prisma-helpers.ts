export function countAll(count: unknown): number {
    if (typeof count === 'object' && count !== null && '_all' in count) {
      return (count as { _all?: number })._all ?? 0
    }
    return 0
  }