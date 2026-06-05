import { execSync } from 'child_process'

function verifyAdminWorkspace() {
  console.log('⏳ Running admin workspace health check...')

  try {
    console.log('  › prisma generate')
    execSync('npx prisma generate', { stdio: 'inherit' })

    console.log('  › tsc --noEmit')
    execSync('npx tsc --noEmit', { stdio: 'inherit' })

    console.log('✅ Workspace clean: schema and types are in sync.')
  } catch {
    console.error('❌ Verification failed. Fix type errors or run db:pull to resync schema.')
    process.exit(1)
  }
}

verifyAdminWorkspace()
