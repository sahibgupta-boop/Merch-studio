export default function Chips({ options, value, onChange, multi = false, max, disabledIds = [] }) {
  const selected = multi ? value : [value]

  const toggle = (id) => {
    if (disabledIds.includes(id)) return
    if (!multi) return onChange(id)
    if (selected.includes(id)) return onChange(selected.filter((x) => x !== id))
    if (max && selected.length >= max) return
    onChange([...selected, id])
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o.id)
        const off = disabledIds.includes(o.id)
        return (
          <button key={o.id} type="button" onClick={() => toggle(o.id)} disabled={off}
            title={o.hint || o.mood || undefined}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              off ? 'cursor-not-allowed border-edge/50 text-muted/40'
              : on ? 'border-accent bg-accent/20 text-white'
              : 'border-edge bg-panel text-muted hover:border-white/25 hover:text-white'
            }`}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
