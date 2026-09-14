export default function ValidationList({ issues }) {
  const errors = issues.filter((i) => i.level === 'error')
  const warnings = issues.filter((i) => i.level === 'warn')

  if (!issues.length) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
        <p className="text-sm text-emerald-300">Ready to generate</p>
        <p className="mt-0.5 text-[11px] leading-snug text-emerald-300/70">
          Every constraint passes for this garment, method and palette.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {errors.map((i, n) => (
        <div key={`e${n}`} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-red-400">Blocks export</p>
          <p className="mt-0.5 text-xs leading-snug text-red-200">{i.message}</p>
        </div>
      ))}
      {warnings.map((i, n) => (
        <div key={`w${n}`} className="rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400/90">Check</p>
          <p className="mt-0.5 text-xs leading-snug text-amber-100/80">{i.message}</p>
        </div>
      ))}
    </div>
  )
}
