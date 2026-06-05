import { WorkflowBuilder } from '@/components/nexus/WorkflowBuilder'

export const metadata = {
  title: 'Workflow Builder | Latimore Hub OS',
  description: 'Build, save, and run multi-step AI workflows — email drip campaigns, compliance audits, marketing automations, and more.',
}

export default function WorkflowPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <WorkflowBuilder />
    </div>
  )
}
