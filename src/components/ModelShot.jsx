import { useState } from 'react'

export default function ModelShot({ onGenerate, disabled }) {
  const [state, setState] = useState({ status: 'idle' })

  const run = async () => {
    setState({ status: 'loading' })
    try {
      const res = await onGenerate()
      setState({ status: 'done', src: `data:${res.mime};base64,${res.image}` })
    } catch (e) {
      setState({ status: 'error', message: e.message, kind: e.kind })
    }
  }

  return (
    <div className="space-y-2.5">
      <button type="button" onClick={run} disabled={disabled || state.status === 'loading'}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors ${
          disabled ? 'cursor-not-allowed border-edge/50 text-muted/40'
          : state.status === 'loading' ? 'border-edge bg-panel text-muted'
          : 'border-edge bg-panel text-white hover:border-white/30'
        }`}>
        {state.status === 'loading' ? 'Generating model shot…'
          : state.status === 'done' ? 'Regenerate model shot'
          : 'Generate model shot'}
      </button>

      {state.status === 'done' && (
        <figure className="space-y-1.5">
          <img src={state.src} alt="Model wearing the design"
            className="w-full rounded-lg border border-edge" />
          <figcaption className="text-[11px] leading-relaxed text-muted">
            AI-generated visualisation for listings and previews. Not a print file — the
            separations in the pack are the production assets.
          </figcaption>
        </figure>
      )}

      {state.status === 'error' && (
        <div className={`rounded-lg border px-3 py-2 ${
          state.kind === 'no_key'
            ? 'border-amber-500/25 bg-amber-500/[0.07]'
            : 'border-red-500/30 bg-red-500/10'
        }`}>
          <p className={`text-[11px] font-medium uppercase tracking-wider ${
            state.kind === 'no_key' ? 'text-amber-400/90' : 'text-red-400'
          }`}>{state.kind === 'no_key' ? 'Not configured' : 'Failed'}</p>
          <p className={`mt-0.5 text-xs leading-snug ${
            state.kind === 'no_key' ? 'text-amber-100/80' : 'text-red-200'
          }`}>{state.message}</p>
        </div>
      )}

      {state.status === 'idle' && (
        <p className="text-[11px] leading-relaxed text-muted">
          Sends the composed artwork to Gemini as a conditioning image, so the model
          wears this exact design rather than an approximation of it. Billed per image.
        </p>
      )}
    </div>
  )
}
