'use client'

import React, { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartRow = { name: string; Inquiries: number }

export default function RevenueAnalytics() {
  const [chartData, setChartData] = useState<ChartRow[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/admin/insights/funnel')
      .then(res => res.json())
      .then((resData: { data: { productInterest: string; stage: string; _count: { _all: number } }[] }) => {
        const totals: Record<string, number> = {}
        for (const item of resData.data) {
          totals[item.productInterest] = (totals[item.productInterest] ?? 0) + item._count._all
        }
        setChartData(
          Object.entries(totals).map(([name, Inquiries]) => ({ name, Inquiries }))
        )
      })
      .catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex items-center justify-center text-slate-400 text-sm">
        Failed to load analytics.
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">
        Product Stream Conversion Performance
      </h2>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: '#f8fafc' }} />
          <Legend />
          <Bar dataKey="Inquiries" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
