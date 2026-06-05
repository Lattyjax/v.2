import type { Message } from './types'

export const chatWithCopilot = async (
  message: string,
  history: Message[],
  fileSystem: unknown
): Promise<Message> => {
  const response = await fetch('/api/admin/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.map(h => ({
        role: h.role,
        content: h.content,
        thought: h.thought,
        actions: h.actions,
      })),
      fileSystem,
    }),
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data?.error || 'Nexus Copilot request failed')
  return data
}
