import { AutonomousMonitor } from '@/components/nexus/AutonomousMonitor'

export const metadata = {
  title: 'Autonomous Monitor | Latimore Hub OS',
  description: 'Real-time workflow monitoring, active agent status, and system health for Latimore Hub OS.',
}

export default function AutonomousMonitorPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <AutonomousMonitor />
    </div>
  )
}
