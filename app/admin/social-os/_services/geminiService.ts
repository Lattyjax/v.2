async function callSocialOsAI(action: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/admin/ai/social-os', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.ok) throw new Error(json?.error || 'Social OS AI request failed')
  return json.data
}

export const generateSocialContent = async (topic: string, platform: string) => {
  try { return await callSocialOsAI('socialContent', { topic, platform }) } catch (e) { console.error(e); return [] }
}
export const generateContentFromAsset = async (base64Data: string, mimeType: string, platform: string) => {
  try { return await callSocialOsAI('assetContent', { base64Data, mimeType, platform }) } catch (e) { console.error(e); return [] }
}
export const generateBulkCampaign = async (goal: string, persona: string) => {
  try { return await callSocialOsAI('bulkCampaign', { goal, persona }) } catch (e) { console.error(e); return [] }
}
export const generateFunnelStrategy = async (goal: string, persona: string) => {
  try { return await callSocialOsAI('funnelStrategy', { goal, persona }) } catch (e) { console.error(e); return [] }
}
export const generateTemplateStructure = async (prompt: string) => {
  try { return await callSocialOsAI('templateStructure', { prompt }) } catch (e) { console.error(e); return null }
}
export const generateClientSnapshot = async (notes: string, household: string) => {
  try { return await callSocialOsAI('clientSnapshot', { notes, household }) } catch (e) { console.error(e); return null }
}
export const generateReviewScript = async (clientData: any) => {
  try { return await callSocialOsAI('reviewScript', { clientData }) } catch (e) { console.error(e); return null }
}
export const generateSocialStrategy = async (topic: string) => {
  try { return await callSocialOsAI('socialStrategy', { topic }) } catch (e) { console.error(e); return null }
}
export const analyzeTrends = async () => {
  try { return await callSocialOsAI('trends', {}) } catch (e) { console.error(e); return [] }
}
export const chatWithGemini = async (message: string, history: any[]) => {
  try { return await callSocialOsAI('chat', { message, history }) } catch (e) { console.error(e); return 'Connection issue. Please try again.' }
}
