export default function StatPill({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string | number
  tone?: 'default' | 'good' | 'warn' | 'danger'
}) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
      : tone === 'warn'
        ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
        : tone === 'danger'
          ? 'border-red-400/20 bg-red-400/10 text-red-300'
          : 'border-white/10 bg-white/5 text-[#D7DCE5]'

  return (
    <div className={`rounded-full border px-3 py-1.5 text-xs font-medium ${toneClass}`}>
      <span className="mr-1 text-[#A9B1BE]">{label}:</span>
      <span>{value}</span>
    </div>
  )
}
