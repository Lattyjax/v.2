'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { CheckSquare, Clock, Plus, RefreshCw } from 'lucide-react'

type TaskItem = {
  id: string
  title: string
  description: string | null
  status: string
  dueAt: string | null
  contact: { email: string | null } | null
}

export default function Tasks() {
  const [items, setItems] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const openItems = useMemo(() => items.filter((task) => task.status === 'Open'), [items])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks')
      const payload = await response.json()
      setItems(payload.items ?? [])
    } finally {
      setLoading(false)
    }
  }

  const createTask = async () => {
    const title = newTitle.trim()
    if (!title) return

    setCreating(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title }),
      })

      if (response.ok) {
        setNewTitle('')
        await loadTasks()
      }
    } finally {
      setCreating(false)
    }
  }

  const completeTask = async (id: string) => {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status: 'Completed' }),
    })
    await loadTasks()
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const now = new Date()

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F7F7F5]">Tasks</h1>
          <p className="text-[#A9B1BE] text-sm mt-1">{openItems.length} open follow-up{openItems.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={loadTasks} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-[#F7F7F5] hover:bg-white/5">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="mb-5 flex gap-2">
        <input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && createTask()}
          placeholder="Add a new task"
          className="flex-1 rounded-lg border border-white/10 bg-[#1a2535] px-3 py-2 text-sm text-white placeholder:text-[#8F98A8]"
        />
        <button disabled={creating || !newTitle.trim()} onClick={createTask} className="inline-flex items-center gap-2 rounded-lg bg-[#C9A25F] px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50">
          <Plus size={14} /> Add
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[#A9B1BE]">Loading tasks...</div>
      ) : openItems.length === 0 ? (
        <div className="border border-[#F7F7F5]/8 rounded-xl p-12 text-center text-[#A9B1BE]">
          <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>All clear — no open tasks.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {openItems.map((task) => {
            const dueDate = task.dueAt ? new Date(task.dueAt) : null
            const overdue = Boolean(dueDate && dueDate < now)

            return (
              <div key={task.id} className={`bg-[#1a2535] border rounded-xl p-4 flex items-start justify-between gap-4 ${overdue ? 'border-red-500/30' : 'border-[#F7F7F5]/6'}`}>
                <div>
                  <p className="font-medium text-[#F7F7F5] text-sm">{task.title}</p>
                  {task.contact?.email && <p className="text-[#A9B1BE] text-xs mt-1">{task.contact.email}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs shrink-0 ${overdue ? 'text-red-400' : 'text-[#A9B1BE]'}`}>
                    <Clock size={12} />
                    {dueDate ? dueDate.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'No due date'}
                  </div>
                  <button onClick={() => completeTask(task.id)} className="rounded-md border border-white/10 px-2 py-1 text-xs text-[#F7F7F5] hover:bg-white/5">
                    Complete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
