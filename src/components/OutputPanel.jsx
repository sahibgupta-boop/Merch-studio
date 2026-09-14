import { useState } from 'react'
import ModelShot from './ModelShot.jsx'

export default function OutputPanel({
  artworks, blocked, onGenerate, onDownloadPack, onModelShot, seed, theme
}) {
  const [packing, setPacking] = useState(false)

  const pack = async () => {
    setPacking(true)
    try { await onDownloadPack() } finally { setPacking(false) }
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={onGenerate} disabled={blocked}
        className={`w-full rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
          blocked
            ? 'cursor-not-allowed bg-panel text-muted/40'
            : 'bg-accent text-white hover:bg-accent/90'
        }`}>
        {blocked ? 'Fix blocking issues to generate' : artworks ? 'Regenerate artwork' : 'Generate artwork'}
      </button>

      {!artworks && !blocked && (
        <p className="text-[11px] leading-relaxed text-muted">
          Composes vector artwork for every selected placement, at true physical size.
          Same seed and same fields always produce the same result.
        </p>
      )}

      {artworks && (
        <>
          <div className="rounded-lg border border-edge bg-panel/50 px-3 py-2.5">
            <p className="text-xs text-white">
              {artworks.length} separation{artworks.length === 1 ? '' : 's'} composed
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              seed {seed}<br />
              {artworks.map((a) => `${a.placement.label}: ${a.pxWidth}×${a.pxHeight}px`).join(' · ')}
            </p>
          </div>

          <button type="button" onClick={pack} disabled={packing}
            className="w-full rounded-lg border border-edge bg-panel px-3 py-2.5 text-sm text-white transition-colors hover:border-white/30 disabled:text-muted">
            {packing ? 'Building pack…' : 'Download design pack (.zip)'}
          </button>
          <p className="-mt-2 text-[11px] leading-relaxed text-muted">
            300 DPI transparent PNGs, source SVGs with the typeface embedded, the tech
            pack, and the brief.
          </p>

          <div className="border-t border-edge pt-4">
            <h3 className="mb-2 text-sm font-medium text-white">Worn product shot</h3>
            <ModelShot onGenerate={onModelShot} disabled={!artworks} />
          </div>
        </>
      )}
    </div>
  )
}
