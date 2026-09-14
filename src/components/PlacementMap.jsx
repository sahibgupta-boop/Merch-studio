import { PLACEMENT_ORDER, PLACEMENTS } from '../data/placements.js'

export default function PlacementMap({ garment, selected, onToggle, onHover }) {
  return (
    <ul className="space-y-1.5">
      {PLACEMENT_ORDER.map((id) => {
        const def = PLACEMENTS[id]
        const a = garment.print[id]
        if (!a) return null
        const on = selected.includes(id)

        if (!a.enabled) {
          return (
            <li key={id} title={a.reason}
              className="flex cursor-not-allowed items-start gap-2 rounded-lg border border-edge/60 bg-panel/40 px-3 py-2 opacity-55">
              <span className="mt-0.5 block h-4 w-4 shrink-0 rounded border border-edge" />
              <span className="min-w-0">
                <span className="block text-sm text-muted line-through decoration-muted/50">{def.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted/80">{a.reason}</span>
              </span>
            </li>
          )
        }

        return (
          <li key={id}>
            <button type="button"
              onClick={() => onToggle(id)}
              onMouseEnter={() => onHover(id)}
              onMouseLeave={() => onHover(null)}
              className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                on ? 'border-accent bg-accent/12' : 'border-edge bg-panel hover:border-white/25'
              }`}>
              <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                on ? 'border-accent bg-accent text-white' : 'border-edge'
              }`}>{on ? '✓' : ''}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-white">{def.label}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted">{a.w}″ × {a.h}″</span>
                </span>
                {a.note && (
                  <span className="mt-0.5 block text-[11px] leading-snug text-amber-400/85">{a.note}</span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
