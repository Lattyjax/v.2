export const CATEGORIES = ['Young Families', 'Pre-Retirees', 'School Districts'] as const
export type Category = (typeof CATEGORIES)[number]
