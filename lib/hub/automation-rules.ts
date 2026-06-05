import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export type RuleTrigger = 'sentiment_high' | 'engagement_spike' | 'lead_high' | 'compliance_risk'
export type RuleAction  = 'create_task' | 'send_notification' | 'tag_contact' | 'create_insight'

export interface AutomationRuleDefinition {
  trigger:   { type: RuleTrigger; threshold?: number }
  condition: { field: string; operator: string; value: string | number }
  actions:   Array<{ type: RuleAction; payload: Record<string, unknown> }>
}

interface EvalContext {
  sentiment?:      string
  confidence?:     number
  leadPotential?:  string
  complianceRisk?: string
  engagementDelta?: number
  contactId?:      string
  postId?:         string
  commentBody?:    string
}

function matchesCondition(
  condition: AutomationRuleDefinition['condition'],
  ctx: EvalContext,
): boolean {
  const val = (ctx as Record<string, unknown>)[condition.field]
  if (val === undefined) return false
  switch (condition.operator) {
    case 'eq':  return val === condition.value
    case 'gte': return Number(val) >= Number(condition.value)
    case 'gt':  return Number(val) >  Number(condition.value)
    case 'contains': return String(val).toLowerCase().includes(String(condition.value).toLowerCase())
    default:    return false
  }
}

async function runAction(action: AutomationRuleDefinition['actions'][0], ctx: EvalContext) {
  switch (action.type) {
    case 'create_task':
      if (ctx.contactId) {
        await prisma.task.create({
          data: {
            title:       String(action.payload.title ?? 'Follow up'),
            description: String(action.payload.description ?? ''),
            status:      'Open',
            contactId:   ctx.contactId,
          },
        })
      }
      break

    case 'create_insight':
      await prisma.insight.create({
        data: {
          type:     String(action.payload.type     ?? 'automation_rule'),
          severity: String(action.payload.severity ?? 'medium'),
          title:    String(action.payload.title    ?? 'Automation triggered'),
          summary:  String(action.payload.summary  ?? JSON.stringify(ctx)),
          action:   action.payload.action ? String(action.payload.action) : undefined,
          source:   ctx as object,
          status:   'open',
          ...(ctx.postId ? { postId: ctx.postId } : {}),
        },
      })
      break

    case 'send_notification':
      // Extend with Twilio / Resend when ready
      logger.info({ payload: action.payload, ctx }, 'automation_rules: send_notification')
      break

    case 'tag_contact':
      // Extend when Contact gains a tags field
      logger.info({ payload: action.payload, ctx }, 'automation_rules: tag_contact')
      break

    default:
      logger.warn({ action }, 'automation_rules: unknown action type')
  }
}

export async function evaluateRules(trigger: RuleTrigger, ctx: EvalContext) {
  const rules = await prisma.automationRule.findMany({ where: { isActive: true } })

  for (const rule of rules) {
    const def = rule as unknown as { trigger: AutomationRuleDefinition['trigger']; condition: AutomationRuleDefinition['condition']; actions: AutomationRuleDefinition['actions'] }
    if (def.trigger?.type !== trigger) continue
    if (!matchesCondition(def.condition, ctx)) continue

    logger.info({ ruleId: rule.id, ruleName: rule.name, trigger, ctx }, 'automation_rules: rule matched')
    for (const action of def.actions ?? []) {
      try {
        await runAction(action, ctx)
      } catch (err) {
        logger.error({ ruleId: rule.id, action, err }, 'automation_rules: action failed')
      }
    }
  }
}
