import { useState } from 'react'
import GarmentSilhouette from './GarmentSilhouette.jsx'
import SizeChart from './SizeChart.jsx'
import { SIZES, REFERENCE_SIZE, bandForSize } from '../data/sizeCharts.js'
import { GARMENT_COLOURS, COLOURS_BY_ID } from '../data/garmentColours.js'

const VIEWS = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'sleeve', label: 'Sleeve' }
]

export default function FitSizePanel({
  garment, size, onSize, colourId, onColour,
  activePlacements, highlight, perSizeScaling, onPerSizeScaling,
  artworks = null
}) {
  const [view, setView] = useState('front')
  const colour = COLOURS_BY_ID[colourId]
  const band = bandForSize(size)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-white">Fit &amp; size</h2>
          <p className="text-xs text-muted">{garment.label}</p>
        </div>
        <div className="flex rounded-lg border border-edge bg-panel p-0.5">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" onClick={() => setView(v.id)}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                view === v.id ? 'bg-white/12 text-white' : 'text-muted hover:text-white'
              }`}>{v.label}</button>
          ))}
        </div>
      </div>

      <div className="relative rounded-xl border border-edge bg-gradient-to-b from-white/[0.04] to-transparent p-2">
        <div className="aspect-[26/30] w-full">
          <GarmentSilhouette
            garment={garment} size={size} view={view} colour={colour}
            activePlacements={activePlacements} highlight={highlight}
            artworks={artworks}
          />
        </div>
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[11px] text-muted">
          {size} · {view}{artworks ? ' · product' : ''}
        </div>
        {size !== REFERENCE_SIZE && (
          <div className="pointer-events-none absolute right-3 top-3 rounded bg-black/50 px-2 py-1 text-[11px] text-amber-300/90">
            drawn to scale vs {REFERENCE_SIZE}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted">Size</span>
          <span className="font-mono text-[11px] text-muted">band {band.label}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button key={s} type="button" onClick={() => onSize(s)}
              className={`min-w-[46px] rounded-md border px-2 py-1.5 font-mono text-xs transition-colors ${
                s === size ? 'border-accent bg-accent/20 text-white' : 'border-edge bg-panel text-muted hover:text-white'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-xs uppercase tracking-wider text-muted">Garment colour</span>
        <div className="flex flex-wrap gap-1.5">
          {GARMENT_COLOURS.map((c) => (
            <button key={c.id} type="button" title={c.label} onClick={() => onColour(c.id)}
              style={{ backgroundColor: c.hex }}
              className={`h-7 w-7 rounded-full border-2 transition-transform ${
                c.id === colourId ? 'border-accent scale-110' : 'border-edge hover:scale-105'
              }`} />
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-edge bg-panel px-3 py-2.5">
        <input type="checkbox" checked={perSizeScaling}
          onChange={(e) => onPerSizeScaling(e.target.checked)}
          className="mt-0.5 accent-[#e8503a]" />
        <span>
          <span className="block text-sm text-white">Per-size scaling</span>
          <span className="mt-0.5 block text-[11px] leading-snug text-muted">
            Export a separate separation set per size band (S–M, L–XL, 2XL+) instead of one
            file scaled by the printer. This is what most POD suppliers expect.
          </span>
        </span>
      </label>

      <div className="rounded-xl border border-edge bg-panel/50">
        <SizeChart garment={garment} size={size} onSize={onSize} />
      </div>
    </div>
  )
}
