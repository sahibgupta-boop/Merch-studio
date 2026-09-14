import { useEffect, useMemo, useState } from 'react'
import GarmentPicker from '../components/GarmentPicker.jsx'
import FitSizePanel from '../components/FitSizePanel.jsx'
import PlacementMap from '../components/PlacementMap.jsx'
import StylePanel from '../components/StylePanel.jsx'
import ProductionPanel from '../components/ProductionPanel.jsx'
import ValidationList from '../components/ValidationList.jsx'
import BriefPreview from '../components/BriefPreview.jsx'
import OutputPanel from '../components/OutputPanel.jsx'
import ArtworkSheet from '../components/ArtworkSheet.jsx'
import { GARMENTS_BY_ID, enabledPlacements } from '../data/garments.js'
import { COLOURS_BY_ID } from '../data/garmentColours.js'
import { STYLES, FEELS } from '../data/vocabularies.js'
import { METHODS_BY_ID, colourCeiling } from '../data/printMethods.js'
import { REFERENCE_SIZE } from '../data/sizeCharts.js'
import { defaultSpec, validate, errorsOf, buildBrief, briefToPrompt } from '../lib/designSpec.js'
import { composeAll } from '../lib/composer.js'
import { buildPack, downloadBlob, svgDataUri, svgToPngBase64, withFonts } from '../lib/export.js'
import { fontStyleFor, preloadPairing } from '../lib/fonts.js'

const TABS = [
  { id: 'garment', label: 'Garment' },
  { id: 'style', label: 'Concept & style' },
  { id: 'production', label: 'Colour & production' },
  { id: 'output', label: 'Output' }
]

export default function Studio() {
  const [tab, setTab] = useState('garment')
  const [garmentId, setGarmentId] = useState('crew_tee')
  const [size, setSize] = useState(REFERENCE_SIZE)
  const [colourId, setColourId] = useState('black')
  const [selected, setSelected] = useState(['front_full'])
  const [highlight, setHighlight] = useState(null)
  const [perSizeScaling, setPerSizeScaling] = useState(false)
  const [spec, setSpec] = useState(defaultSpec)
  const [artworks, setArtworks] = useState(null)
  const [showOnGarment, setShowOnGarment] = useState(true)

  const garment = GARMENTS_BY_ID[garmentId]
  const garmentColour = COLOURS_BY_ID[colourId]
  const available = useMemo(() => enabledPlacements(garment), [garment])
  const set = (k, v) => setSpec((s) => ({ ...s, [k]: v }))

  // Switching garment rewrites which placements exist, so drop any selection the
  // new garment physically cannot print rather than carrying invalid state.
  useEffect(() => {
    setSelected((prev) => {
      const kept = prev.filter((id) => available.includes(id))
      return kept.length ? kept : available.slice(0, 1)
    })
  }, [garmentId, available])

  // Switching to a method with a lower ceiling trims the palette to fit, rather
  // than leaving an unexportable spec sitting there.
  useEffect(() => {
    const ceiling = colourCeiling(METHODS_BY_ID[spec.printMethod])
    if (spec.inks.length > ceiling) {
      setSpec((s) => ({ ...s, inks: s.inks.slice(0, ceiling), paletteMode: 'manual' }))
    }
    if (!METHODS_BY_ID[spec.printMethod].gradients && spec.useGradients) {
      setSpec((s) => ({ ...s, useGradients: false }))
    }
  }, [spec.printMethod]) // eslint-disable-line react-hooks/exhaustive-deps

  const ctx = { garmentId, colourId, placements: selected, size, perSizeScaling }
  const issues = useMemo(() => validate(spec, ctx), [spec, garmentId, colourId, selected, size])
  const issueFor = (field) => issues.find((i) => i.field === field)
  const blocked = errorsOf(issues).length > 0

  const brief = useMemo(() => buildBrief(spec, ctx), [spec, garmentId, colourId, selected, size, perSizeScaling])
  const prompt = useMemo(() => briefToPrompt(brief, {
    styleLabels: spec.styles.map((id) => STYLES.find((s) => s.id === id)?.label || id),
    feelLabels: spec.feels.map((id) => FEELS.find((f) => f.id === id)?.label || id)
  }), [brief, spec.styles, spec.feels])

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  // Load the chosen typeface for on-screen preview; export inlines it separately.
  useEffect(() => { preloadPairing(spec.fontPairing) }, [spec.fontPairing])

  // Any change to the inputs invalidates composed artwork, so it is cleared rather
  // than left on screen showing something the current spec would no longer produce.
  useEffect(() => { setArtworks(null) }, [spec, garmentId, colourId, selected, size])

  const generate = () => {
    const composed = composeAll(brief)
    setArtworks(composed)
    setTab('output')
  }

  // Artwork keyed by placement for the garment preview, so the mockup is the real
  // composed vector rather than a stand-in.
  const artworkUris = useMemo(() => {
    if (!artworks) return null
    return Object.fromEntries(artworks.map((a) => [a.placement.id, svgDataUri(a.svg)]))
  }, [artworks])

  const downloadPack = async () => {
    const blob = await buildPack(brief, artworks, { prompt, techPack: brief })
    const name = (brief.concept.theme || 'design').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    downloadBlob(blob, `${name}_${brief.production.garment.id}_${brief.seed}.zip`)
  }

  const modelShot = async () => {
    const front = artworks.find((a) => a.placement.id.startsWith('front'))
      || artworks.find((a) => a.placement.id.includes('chest'))
      || artworks[0]
    const fontStyle = await fontStyleFor(spec.fontPairing)
    const imageBase64 = await svgToPngBase64(withFonts(front.svg, fontStyle), front.pxWidth, front.pxHeight, 1024)

    const res = await fetch('/api/model-shot', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        garment: garment.label,
        colour: garmentColour.label,
        placement: front.placement.label,
        theme: spec.theme,
        audience: spec.audience,
        styleNote: [...spec.styles, ...spec.feels].join(', ')
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data.message || `Request failed (${res.status}).`)
      err.kind = data.error
      throw err
    }
    return data
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="sticky top-0 z-10 border-b border-edge bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <span className="text-base font-semibold tracking-tight">Merch Studio</span>
            <span className="hidden font-mono text-[11px] text-muted sm:inline">
              print-on-demand design generator
            </span>
          </div>
          <nav className="flex rounded-lg border border-edge bg-panel p-0.5">
            {TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  tab === t.id ? 'bg-white/12 text-white' : 'text-muted hover:text-white'
                }`}>{t.label}</button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,320px)]">
        <section className="min-w-0">
          {tab === 'garment' && (
            <>
              <h2 className="mb-3 text-sm font-medium">Garment type</h2>
              <GarmentPicker value={garmentId} onChange={setGarmentId} />
            </>
          )}
          {tab === 'style' && <StylePanel spec={spec} set={set} issueFor={issueFor} />}
          {tab === 'production' && (
            <ProductionPanel spec={spec} set={set} garmentColour={garmentColour} issueFor={issueFor} />
          )}
          {tab === 'output' && (
            <div className="space-y-5">
              <OutputPanel
                artworks={artworks} blocked={blocked} seed={spec.seed} theme={spec.theme}
                onGenerate={generate} onDownloadPack={downloadPack} onModelShot={modelShot}
              />
              {artworks && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Separations</h3>
                    <button type="button" onClick={() => setShowOnGarment((v) => !v)}
                      className="rounded-lg border border-edge px-2.5 py-1 text-xs text-muted transition-colors hover:text-white">
                      {showOnGarment ? 'On garment colour' : 'On transparency'}
                    </button>
                  </div>
                  <ArtworkSheet artworks={artworks} garmentColour={garmentColour} onGround={showOnGarment} />
                </div>
              )}
            </div>
          )}
        </section>

        <section className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <FitSizePanel
            garment={garment} size={size} onSize={setSize}
            colourId={colourId} onColour={setColourId}
            activePlacements={selected} highlight={highlight}
            perSizeScaling={perSizeScaling} onPerSizeScaling={setPerSizeScaling}
            artworks={artworkUris}
          />
        </section>

        <section className="min-w-0 space-y-5">
          <div>
            <h2 className="mb-1 text-sm font-medium">Print placements</h2>
            <p className="mb-3 text-xs leading-relaxed text-muted">
              Areas are specific to a {garment.label.toLowerCase()}. Struck-through rows are
              physically unprintable on this garment — hover for the reason.
            </p>
            <PlacementMap
              garment={garment} selected={selected}
              onToggle={toggle} onHover={setHighlight}
            />
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              “Left chest” is the wearer's left, which appears on the right of a front view.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium">Constraint check</h2>
            <ValidationList issues={issues} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium">Design brief</h2>
            <BriefPreview brief={brief} prompt={prompt} blocked={blocked} />
          </div>
        </section>
      </main>
    </div>
  )
}
