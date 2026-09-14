import { useEffect, useMemo, useState } from 'react'
import GarmentPicker from '../components/GarmentPicker.jsx'
import FitSizePanel from '../components/FitSizePanel.jsx'
import PlacementMap from '../components/PlacementMap.jsx'
import { GARMENTS_BY_ID, enabledPlacements } from '../data/garments.js'
import { REFERENCE_SIZE } from '../data/sizeCharts.js'

export default function Studio() {
  const [garmentId, setGarmentId] = useState('crew_tee')
  const [size, setSize] = useState(REFERENCE_SIZE)
  const [colourId, setColourId] = useState('black')
  const [selected, setSelected] = useState(['front_full'])
  const [highlight, setHighlight] = useState(null)
  const [perSizeScaling, setPerSizeScaling] = useState(false)

  const garment = GARMENTS_BY_ID[garmentId]
  const available = useMemo(() => enabledPlacements(garment), [garment])

  // Switching garment rewrites which placements exist, so drop any selection the
  // new garment physically cannot print rather than carrying an invalid state.
  useEffect(() => {
    setSelected((prev) => {
      const kept = prev.filter((id) => available.includes(id))
      return kept.length ? kept : available.slice(0, 1)
    })
  }, [garmentId, available])

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="border-b border-edge">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <span className="text-base font-semibold tracking-tight">Merch Studio</span>
            <span className="hidden font-mono text-[11px] text-muted sm:inline">
              print-on-demand design generator
            </span>
          </div>
          <span className="rounded-full border border-edge px-2.5 py-1 font-mono text-[11px] text-muted">
            step 1 · garment
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,300px)]">
        <section>
          <h2 className="mb-3 text-sm font-medium">Garment type</h2>
          <GarmentPicker value={garmentId} onChange={setGarmentId} />
        </section>

        <section className="lg:sticky lg:top-6 lg:self-start">
          <FitSizePanel
            garment={garment} size={size} onSize={setSize}
            colourId={colourId} onColour={setColourId}
            activePlacements={selected} highlight={highlight}
            perSizeScaling={perSizeScaling} onPerSizeScaling={setPerSizeScaling}
          />
        </section>

        <section>
          <h2 className="mb-1 text-sm font-medium">Print placements</h2>
          <p className="mb-3 text-xs leading-relaxed text-muted">
            Areas are specific to a {garment.label.toLowerCase()}. Struck-through rows are
            physically unprintable on this garment — hover for the reason.
          </p>
          <PlacementMap
            garment={garment} selected={selected}
            onToggle={toggle} onHover={setHighlight}
          />
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            “Left chest” is the wearer's left, which appears on the right of a front view.
          </p>
        </section>
      </main>
    </div>
  )
}
