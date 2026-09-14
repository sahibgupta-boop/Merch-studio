import { PALETTE_PRESETS } from '../data/vocabularies.js'
import { inkSeparation, isValidHex, normaliseHex, INK_SEPARATION_MIN } from '../lib/colour.js'

export default function PalettePicker({ inks, onChange, garmentColour, ceiling, mode, onMode, preset, onPreset }) {
  const atCeiling = inks.length >= ceiling

  const setInk = (i, hex) => {
    if (!isValidHex(hex)) return
    const next = [...inks]; next[i] = normaliseHex(hex); onChange(next); onMode('manual')
  }
  const remove = (i) => { onChange(inks.filter((_, j) => j !== i)); onMode('manual') }
  const add = () => { if (!atCeiling) { onChange([...inks, '#888888']); onMode('manual') } }

  return (
    <div className="space-y-3">
      <div>
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">Preset palettes</span>
        <div className="flex flex-wrap gap-1.5">
          {PALETTE_PRESETS.map((p) => {
            const over = p.inks.length > ceiling
            const on = mode === 'preset' && preset === p.id
            return (
              <button key={p.id} type="button" disabled={over}
                title={over ? `${p.inks.length} inks exceeds this method's ${ceiling}-colour ceiling` : p.label}
                onClick={() => { onPreset(p.id); onChange(p.inks); onMode('preset') }}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition-colors ${
                  over ? 'cursor-not-allowed border-edge/50 text-muted/40'
                  : on ? 'border-accent bg-accent/20 text-white'
                  : 'border-edge bg-panel text-muted hover:border-white/25 hover:text-white'
                }`}>
                <span className="flex">
                  {p.inks.map((h) => (
                    <span key={h} style={{ backgroundColor: h }}
                      className="h-3 w-3 rounded-full border border-black/30 -ml-0.5 first:ml-0" />
                  ))}
                </span>
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <span className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">Inks</span>
          <span className="font-mono text-[11px] text-muted">
            {inks.length}/{ceiling === Infinity ? '∞' : ceiling}
          </span>
        </span>
        <ul className="space-y-1.5">
          {inks.map((ink, i) => {
            const sep = inkSeparation(ink, garmentColour.hex)
            return (
              <li key={i} className="flex items-center gap-2 rounded-lg border border-edge bg-panel px-2 py-1.5">
                <input type="color" value={ink} onChange={(e) => setInk(i, e.target.value)}
                  className="h-7 w-7 shrink-0 cursor-pointer rounded border border-edge bg-transparent p-0" />
                <input type="text" value={ink.toUpperCase()} onChange={(e) => setInk(i, e.target.value)}
                  className="w-[86px] shrink-0 bg-transparent font-mono text-xs text-white focus:outline-none" />
                <span className={`flex-1 truncate text-[11px] ${
                  sep.severity === 'severe' ? 'text-red-400'
                  : sep.severity === 'low' ? 'text-amber-400/90' : 'text-muted'
                }`}>
                  ΔE {sep.deltaE.toFixed(1)}
                  {!sep.ok && ` — too close to ${garmentColour.label.toLowerCase()}`}
                </span>
                <button type="button" onClick={() => remove(i)}
                  className="shrink-0 rounded px-1.5 text-muted transition-colors hover:text-red-400">×</button>
              </li>
            )
          })}
        </ul>
        <button type="button" onClick={add} disabled={atCeiling}
          className={`mt-2 w-full rounded-lg border border-dashed px-3 py-1.5 text-xs transition-colors ${
            atCeiling ? 'cursor-not-allowed border-edge/50 text-muted/40' : 'border-edge text-muted hover:border-white/25 hover:text-white'
          }`}>
          {atCeiling ? `Colour ceiling reached for this print method` : '+ Add ink'}
        </button>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          ΔE is perceptual distance from the garment colour. Below {INK_SEPARATION_MIN} an ink
          stops reading on the fabric under shop lighting.
        </p>
      </div>
    </div>
  )
}
