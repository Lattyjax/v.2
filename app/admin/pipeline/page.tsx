'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

const COLUMNS = [
  { id: 'New', title: 'New', color: '#3b82f6' },
  { id: 'Attempted_Contact', title: 'Attempted', color: '#14b8a6' },
  { id: 'Qualified', title: 'Qualified', color: '#a855f7' },
  { id: 'Booked', title: 'Booked', color: '#C9A25F' },
  { id: 'Sold', title: 'Sold', color: '#22c55e' },
  { id: 'Follow_Up', title: 'Follow-Up', color: '#f97316' },
  { id: 'Lost', title: 'Lost', color: '#6b7280' },
]

type Inquiry = {
  id: string
  productInterest: string
  createdAt: string
  stage: string
  source?: string | null
  campaign?: string | null
  county?: string | null
  contact: { firstName?: string | null; lastName?: string | null; email?: string | null; phone?: string | null; county?: string | null }
}

export default function Pipeline() {
  const [data, setData] = useState<Record<string, Inquiry[]>>({})
  const [loading, setLoading] = useState(true)

  async function load() {
    const all: Record<string, Inquiry[]> = {}
    await Promise.all(COLUMNS.map(async (col) => {
      const res = await fetch(`/api/inquiries?stage=${col.id}`, { cache: 'no-store' })
      const payload = await res.json()
      all[col.id] = payload.items ?? []
    }))
    setData(all)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function onDragEnd(result: DropResult) {
    const { draggableId, destination, source } = result
    if (!destination || destination.droppableId === source.droppableId) return

    const from = source.droppableId
    const to = destination.droppableId
    const item = data[from]?.find((x) => x.id === draggableId)
    if (!item) return

    setData((current) => ({
      ...current,
      [from]: current[from].filter((x) => x.id !== draggableId),
      [to]: [{ ...item, stage: to }, ...(current[to] ?? [])],
    }))

    await fetch(`/api/inquiries/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: to }),
    })
  }

  if (loading) return <div className="p-6 text-[#A9B1BE]">Loading pipeline…</div>

  const totalCount = Object.values(data).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F7F7F5]">Pipeline</h1>
        <p className="text-[#A9B1BE] text-sm mt-1">{totalCount} total inquiries · drag to update stage</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-3 overflow-x-auto">
          {COLUMNS.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col min-h-[28rem]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>{col.title}</span>
                    <span className="text-xs text-[#A9B1BE] bg-[#F7F7F5]/8 px-2 py-0.5 rounded-full">{(data[col.id] ?? []).length}</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    {(data[col.id] ?? []).map((x, idx) => (
                      <Draggable draggableId={x.id} index={idx} key={x.id}>
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className="bg-[#1a2535] border border-[#F7F7F5]/6 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-[#C9A25F]/30 transition-all"
                          >
                            <p className="text-sm font-semibold text-[#F7F7F5] truncate">
                              {x.contact.firstName} {x.contact.lastName}
                              {!x.contact.firstName && !x.contact.lastName && (
                                <span className="text-[#A9B1BE] text-xs">{x.contact.email ?? x.contact.phone ?? 'Unknown contact'}</span>
                              )}
                            </p>
                            <p className="text-xs text-[#A9B1BE] truncate mt-0.5">{x.contact.email ?? x.contact.phone ?? 'No direct contact info'}</p>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[10px] px-1.5 py-0.5 bg-[#C9A25F]/15 text-[#C9A25F] rounded font-semibold">{x.productInterest}</span>
                              {(x.county ?? x.contact.county) && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-[#F7F7F5]/8 text-[#A9B1BE] rounded">{x.county ?? x.contact.county}</span>
                              )}
                            </div>

                            {(x.source || x.campaign) && (
                              <p className="text-[10px] text-[#A9B1BE]/70 mt-2 truncate">
                                {x.source ?? 'Direct'}{x.campaign ? ` · ${x.campaign}` : ''}
                              </p>
                            )}

                            <p className="text-[10px] text-[#A9B1BE]/50 mt-2">{new Date(x.createdAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
