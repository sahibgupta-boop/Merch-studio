import { SIZES, SIZE_CHARTS, REFERENCE_SIZE } from '../data/sizeCharts.js'

const cm = (inches) => (inches * 2.54).toFixed(1)

export default function SizeChart({ garment, size, onSize }) {
  const chart = SIZE_CHARTS[garment.chart]
  const hasSleeve = garment.silhouette.sleeve !== 'none'

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-2 py-2 font-medium">Size</th>
            <th className="px-2 py-2 font-medium">Chest</th>
            <th className="px-2 py-2 font-medium">Length</th>
            <th className="px-2 py-2 font-medium">Shoulder</th>
            {hasSleeve && <th className="px-2 py-2 font-medium">Sleeve</th>}
          </tr>
        </thead>
        <tbody>
          {SIZES.map((s) => {
            const row = chart.rows[s]
            const active = s === size
            return (
              <tr key={s}
                onClick={() => onSize(s)}
                className={`cursor-pointer border-t border-edge transition-colors ${
                  active ? 'bg-accent/15 text-white' : 'text-muted hover:bg-white/5'
                }`}>
                <td className="px-2 py-2 font-mono font-medium">
                  {s}
                  {s === REFERENCE_SIZE && (
                    <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      ref
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 font-mono">{row.chest}″ <span className="text-xs opacity-60">/ {cm(row.chest)}cm</span></td>
                <td className="px-2 py-2 font-mono">{row.length}″ <span className="text-xs opacity-60">/ {cm(row.length)}cm</span></td>
                <td className="px-2 py-2 font-mono">{row.shoulder}″ <span className="text-xs opacity-60">/ {cm(row.shoulder)}cm</span></td>
                {hasSleeve && <td className="px-2 py-2 font-mono">{row.sleeve}″ <span className="text-xs opacity-60">/ {cm(row.sleeve)}cm</span></td>}
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-3 px-2 text-xs leading-relaxed text-muted">
        Reference values for a <span className="text-white/80">{chart.label.toLowerCase()}</span> blank.
        Confirm against your supplier's spec sheet before a print run — blanks vary by brand.
        Print separations are authored at size {REFERENCE_SIZE} unless per-size scaling is on.
      </p>
    </div>
  )
}
