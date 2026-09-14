import { GARMENT_GROUPS, garmentsInGroup, enabledPlacements } from '../data/garments.js'

export default function GarmentPicker({ value, onChange }) {
  return (
    <div className="space-y-5">
      {GARMENT_GROUPS.map((group) => (
        <div key={group.id}>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{group.label}</h3>
          <div className="grid grid-cols-2 gap-2">
            {garmentsInGroup(group.id).map((g) => {
              const active = g.id === value
              const count = enabledPlacements(g).length
              return (
                <button key={g.id} type="button" onClick={() => onChange(g.id)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? 'border-accent bg-accent/15 text-white'
                      : 'border-edge bg-panel text-muted hover:border-white/25 hover:text-white'
                  }`}>
                  <span className="block leading-snug">{g.label}</span>
                  <span className="mt-1 block font-mono text-[11px] opacity-60">
                    {count} print area{count === 1 ? '' : 's'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
