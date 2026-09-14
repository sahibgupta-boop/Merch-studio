import { PRINT_METHODS, METHODS_BY_ID, colourCeiling } from '../data/printMethods.js'
import { Field, Section } from './ui/Field.jsx'
import PalettePicker from './PalettePicker.jsx'
import { newSeed } from '../lib/designSpec.js'

export default function ProductionPanel({ spec, set, garmentColour, issueFor }) {
  const method = METHODS_BY_ID[spec.printMethod]
  const ceiling = colourCeiling(method)

  return (
    <div className="space-y-7">
      <Section title="Print method"
        description="This is the constraint that drives everything below it — colour ceiling, gradients, and how fine the detail can go.">
        <div className="space-y-1.5">
          {PRINT_METHODS.map((m) => {
            const on = m.id === spec.printMethod
            return (
              <button key={m.id} type="button" onClick={() => set('printMethod', m.id)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  on ? 'border-accent bg-accent/12' : 'border-edge bg-panel hover:border-white/25'
                }`}>
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-white">{m.label}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted">
                    {m.maxColours ? `${m.maxColours} colours` : 'full colour'}
                  </span>
                </span>
                {on && (
                  <span className="mt-1.5 block space-y-1">
                    <span className="block text-[11px] leading-snug text-muted">{m.bestFor}</span>
                    <span className="block text-[11px] leading-snug text-amber-400/80">{m.watchOut}</span>
                    <span className="mt-1 block font-mono text-[10px] text-muted">
                      min stroke {m.minStrokeIn}″ · {m.gradients ? 'gradients ok' : 'flat fills only'} · detail ≤{m.maxComplexity}
                    </span>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <label className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${
          method.gradients ? 'cursor-pointer border-edge bg-panel' : 'cursor-not-allowed border-edge/50 bg-panel/40 opacity-55'
        }`}>
          <input type="checkbox" checked={spec.useGradients} disabled={!method.gradients}
            onChange={(e) => set('useGradients', e.target.checked)} className="mt-0.5 accent-[#e8503a]" />
          <span>
            <span className="block text-sm text-white">Allow gradients</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-muted">
              {method.gradients
                ? 'Smooth blends instead of flat fills.'
                : `${method.label} cannot hold a smooth blend — the composer halftones instead.`}
            </span>
          </span>
        </label>
      </Section>

      <Section title="Colour"
        description={`Palettes larger than this method's ceiling are disabled rather than silently truncated.`}>
        <PalettePicker
          inks={spec.inks} onChange={(v) => set('inks', v)}
          garmentColour={garmentColour} ceiling={ceiling}
          mode={spec.paletteMode} onMode={(v) => set('paletteMode', v)}
          preset={spec.palettePreset} onPreset={(v) => set('palettePreset', v)}
        />
        {issueFor('inks') && (
          <p className={`text-[11px] leading-snug ${
            issueFor('inks').level === 'error' ? 'text-red-400' : 'text-amber-400/90'
          }`}>{issueFor('inks').message}</p>
        )}
      </Section>

      <Section title="Output" description="The seed makes a design reproducible — same seed and same fields give the same artwork.">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Variations" hint="per run">
            <input type="number" min={1} max={12} value={spec.variations}
              onChange={(e) => set('variations', Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-white focus:border-accent focus:outline-none" />
          </Field>
          <Field label="Seed">
            <div className="flex gap-1.5">
              <input type="text" value={spec.seed} onChange={(e) => set('seed', e.target.value.toUpperCase())}
                className="w-full min-w-0 rounded-lg border border-edge bg-panel px-3 py-2 font-mono text-sm text-white focus:border-accent focus:outline-none" />
              <button type="button" onClick={() => set('seed', newSeed())}
                title="New seed"
                className="shrink-0 rounded-lg border border-edge bg-panel px-2.5 text-muted transition-colors hover:text-white">↻</button>
            </div>
          </Field>
        </div>
      </Section>
    </div>
  )
}
