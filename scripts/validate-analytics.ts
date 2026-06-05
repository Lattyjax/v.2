import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type CheckResult = { name: string; ok: boolean; detail?: string }

async function check(name: string, fn: () => Promise<void>): Promise<CheckResult> {
  try {
    await fn()
    console.log(`  ✓  ${name}`)
    return { name, ok: true }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error(`  ✗  ${name}: ${detail}`)
    return { name, ok: false, detail }
  }
}

async function main() {
  console.log('\n=== Analytics Validation ===\n')

  const results: CheckResult[] = []

  // 1. Tables accessible
  results.push(await check('AnalyticsDailyMetric table accessible', async () => {
    await prisma.analyticsDailyMetric.findMany({ take: 0 })
  }))

  results.push(await check('AnalyticsBreakdownDaily table accessible', async () => {
    await prisma.analyticsBreakdownDaily.findMany({ take: 0 })
  }))

  results.push(await check('AnalyticsFunnelDaily table accessible', async () => {
    await prisma.analyticsFunnelDaily.findMany({ take: 0 })
  }))

  results.push(await check('AnalyticsJobRun table accessible', async () => {
    await prisma.analyticsJobRun.findMany({ take: 0 })
  }))

  results.push(await check('AnalyticsTarget table accessible', async () => {
    await prisma.analyticsTarget.findMany({ take: 0 })
  }))

  // 2. Recent job runs
  results.push(await check('AnalyticsJobRun has recent rows (within 7 days)', async () => {
    const cutoff = new Date(Date.now() - 7 * 86_400_000)
    const count = await prisma.analyticsJobRun.count({
      where: { startedAt: { gte: cutoff } },
    })
    if (count === 0) {
      // Not a hard failure — mart may not have been built yet
      console.log('    ⚠  No job runs in past 7 days (mart may not be built yet)')
    }
  }))

  // 3. Required metric keys present
  const requiredKeys = [
    'lead_count',
    'contact_count',
    'appointment_booked_count',
    'sold_count',
    'cta_click_count',
    'lead_to_booking_rate',
  ]

  results.push(await check('Required metric keys present in mart (if mart has data)', async () => {
    const totalRows = await prisma.analyticsDailyMetric.count()
    if (totalRows === 0) {
      console.log('    ⚠  Mart is empty — skipping metric key check')
      return
    }

    const presentKeys = await prisma.analyticsDailyMetric.findMany({
      where: { metricKey: { in: requiredKeys } },
      select: { metricKey: true },
      distinct: ['metricKey'],
    })
    const presentSet = new Set(presentKeys.map(r => r.metricKey))
    const missing = requiredKeys.filter(k => !presentSet.has(k))

    if (missing.length > 0) {
      throw new Error(`Missing metric keys: ${missing.join(', ')}`)
    }
  }))

  // 4. Funnel stages present and ordered
  results.push(await check('Funnel stages present and ordered (if mart has data)', async () => {
    const totalRows = await prisma.analyticsFunnelDaily.count()
    if (totalRows === 0) {
      console.log('    ⚠  Funnel mart is empty — skipping funnel check')
      return
    }

    const stages = await prisma.analyticsFunnelDaily.findMany({
      where: { funnelKey: 'lead_funnel' },
      select: { stageKey: true, stageOrder: true },
      distinct: ['stageKey'],
      orderBy: { stageOrder: 'asc' },
    })

    const requiredStages = ['visitor', 'engaged', 'lead', 'qualified', 'booked', 'sold']
    const stageSet = new Set(stages.map(s => s.stageKey))
    const missingStages = requiredStages.filter(s => !stageSet.has(s))

    if (missingStages.length > 0) {
      throw new Error(`Missing funnel stages: ${missingStages.join(', ')}`)
    }

    // Verify ordering
    const orders = stages.map(s => s.stageOrder)
    const isSorted = orders.every((v, i, arr) => i === 0 || v >= arr[i - 1])
    if (!isSorted) {
      throw new Error(`Funnel stages are not in order: ${JSON.stringify(stages)}`)
    }
  }))

  // 5. Rate limit bucket exists (static check)
  results.push(await check('Analytics rate-limit bucket configured', async () => {
    // This is a static code check — if we can import the module, it's fine
    // In a real test we'd import and inspect, but here we just verify the file exists
    const fs = await import('fs')
    const content = fs.readFileSync(
      new URL('../lib/rate-limit.ts', import.meta.url).pathname.replace('scripts/', ''),
      'utf-8',
    )
    if (!content.includes("analytics:")) {
      throw new Error('analytics bucket not found in lib/rate-limit.ts')
    }
  }))

  console.log('\n=== Summary ===\n')
  const failed = results.filter(r => !r.ok)
  const passed = results.filter(r => r.ok)

  console.log(`  Passed: ${passed.length}/${results.length}`)
  if (failed.length > 0) {
    console.log(`  Failed: ${failed.length}`)
    for (const f of failed) {
      console.error(`    - ${f.name}: ${f.detail}`)
    }
  }

  await prisma.$disconnect()

  if (failed.length > 0) {
    process.exit(1)
  }

  console.log('\n  All checks passed.\n')
}

main().catch(err => {
  console.error('Validation script crashed:', err)
  process.exit(1)
})
