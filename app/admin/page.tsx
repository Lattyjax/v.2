/**
 * Admin Overview
 * Redirects to the new Legacy Pulse dashboard from the Vite project integration
 */

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

export default function AdminOverviewPage() {
  redirect('/admin/dashboard')
}
