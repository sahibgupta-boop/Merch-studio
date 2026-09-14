import { bodyPath, detailShapes, placementRect, sleevePanel, VIEW, CX, UPI } from '../lib/silhouette.js'
import { PLACEMENTS } from '../data/placements.js'

function Detail({ s, stroke }) {
  const common = { stroke, strokeWidth: s.width || 1.4, fill: s.fill === 'none' ? 'none' : stroke, strokeLinejoin: 'round' }
  if (s.type === 'path') return <path d={s.d} {...common} fill={s.fill === 'none' ? 'none' : 'none'} />
  if (s.type === 'rect') return <rect x={s.x} y={s.y} width={s.w} height={s.h} {...common} fill="none" />
  if (s.type === 'line') return <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={stroke} strokeWidth={1.4} strokeDasharray={s.dash} />
  if (s.type === 'circle') return <circle cx={s.cx} cy={s.cy} r={s.r} fill={stroke} />
  return null
}

export default function GarmentSilhouette({
  garment, size, view = 'front', colour,
  activePlacements = [], highlight = null, showAreas = true,
  artworks = null
}) {
  const tint = colour?.hex || '#e5e5e3'
  const line = colour?.dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'
  const areaStroke = colour?.dark ? '#ffd166' : '#e8503a'

  if (view === 'sleeve') {
    const panel = sleevePanel(garment, size)
    if (!panel) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted">
          This garment has no sleeve print area.
        </div>
      )
    }
    const sleeveIds = activePlacements.filter((p) => p === 'sleeve_left' || p === 'sleeve_right')
    return (
      <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="h-full w-full">
        <path d={panel.d} fill={tint} stroke={line} strokeWidth="1.6" strokeLinejoin="round" />
        {showAreas && sleeveIds.map((id) => {
          const a = garment.print[id]
          if (!a?.enabled) return null
          const w = a.w * UPI, h = a.h * UPI
          // Sleeve prints sit below the cap seam, centred on the panel.
          const y = panel.y0 + Math.max(12, (panel.len - h) / 2)
          return (
            <g key={id}>
              {artworks?.[id]
                ? <image href={artworks[id]} x={CX - w / 2} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />
                : <>
                    <rect x={CX - w / 2} y={y} width={w} height={h}
                      fill={highlight === id ? 'rgba(232,80,58,0.12)' : 'none'}
                      stroke={areaStroke} strokeWidth="1.4" strokeDasharray="5 3" />
                    <text x={CX} y={y - 5} textAnchor="middle" fontSize="9" fill={areaStroke} className="font-mono">
                      {a.w}″ × {a.h}″
                    </text>
                  </>}
            </g>
          )
        })}
      </svg>
    )
  }

  const d = bodyPath(garment, size, view)
  const { behind, front } = detailShapes(garment, size, view)
  const visible = activePlacements.filter((id) => PLACEMENTS[id]?.view === view)

  return (
    <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="h-full w-full">
      {behind.map((s) => (
        <path key={s.key} d={s.d} fill={tint} stroke={line} strokeWidth="1.6" strokeLinejoin="round" />
      ))}
      <path d={d} fill={tint} stroke={line} strokeWidth="1.8" strokeLinejoin="round" />
      {front.map((s) => <Detail key={s.key} s={s} stroke={line} />)}

      {showAreas && visible.map((id) => {
        const a = garment.print[id]
        if (!a?.enabled) return null
        const r = placementRect(garment, size, id, PLACEMENTS[id], a)
        const on = highlight === id
        const art = artworks?.[id]
        return (
          <g key={id}>
            {art
              ? <image href={art} x={r.x} y={r.y} width={r.w} height={r.h} preserveAspectRatio="xMidYMid meet" />
              : <rect x={r.x} y={r.y} width={r.w} height={r.h}
                  fill={on ? (colour?.dark ? 'rgba(255,209,102,0.16)' : 'rgba(232,80,58,0.12)') : 'none'}
                  stroke={areaStroke} strokeWidth={on ? 2 : 1.3} strokeDasharray={on ? '' : '5 3'} />}
            {on && (
              <text x={r.cx} y={r.y - 4} textAnchor="middle" fontSize="9"
                fill={areaStroke} className="font-mono">
                {a.w}″ × {a.h}″
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
