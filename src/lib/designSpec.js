import { METHODS_BY_ID, colourCeiling } from '../data/printMethods.js'
import { GARMENTS_BY_ID, enabledPlacements } from '../data/garments.js'
import { COLOURS_BY_ID } from '../data/garmentColours.js'
import { PLACEMENTS } from '../data/placements.js'
import { inkSeparation, INK_SEPARATION_MIN } from './colour.js'
import { REFERENCE_SIZE } from '../data/sizeCharts.js'

export const newSeed = () => Math.floor(Math.random() * 1e9).toString(36).toUpperCase()

export const defaultSpec = () => ({
  // Concept
  theme: '',
  niche: '',
  audience: '',
  occasion: 'everyday',
  // Style
  styles: ['vector_flat'],
  feels: ['bold'],
  complexity: 3,
  era: 'none',
  layout: 'auto',
  // Typography
  headline: '',
  subline: '',
  textTreatment: 'stacked',
  fontPairing: 'anton_inter',
  // Colour
  paletteMode: 'preset',
  palettePreset: 'varsity',
  inks: ['#f2efe6', '#b3242c', '#1f2a44'],
  // Production
  printMethod: 'dtg',
  useGradients: false,
  seed: newSeed(),
  variations: 4
})

const err = (field, message) => ({ level: 'error', field, message })
const warn = (field, message) => ({ level: 'warn', field, message })

// The constraint pass. Errors block export; warnings are judgement calls the
// seller can knowingly override.
export function validate(spec, { garmentId, colourId, placements, size = REFERENCE_SIZE }) {
  const issues = []
  const method = METHODS_BY_ID[spec.printMethod]
  const garment = GARMENTS_BY_ID[garmentId]
  const garmentColour = COLOURS_BY_ID[colourId]
  if (!method || !garment || !garmentColour) return issues

  // --- Placements
  if (!placements.length) {
    issues.push(err('placements', 'No placement selected — there is nothing to export.'))
  }
  const available = enabledPlacements(garment)
  for (const p of placements) {
    if (!available.includes(p)) {
      issues.push(err('placements',
        `${PLACEMENTS[p]?.label || p} cannot be printed on a ${garment.label.toLowerCase()}.`))
    }
  }

  // --- Colour count against the method's ceiling
  const ceiling = colourCeiling(method)
  if (spec.inks.length > ceiling) {
    issues.push(err('inks',
      `${spec.inks.length} inks exceeds the ${ceiling}-colour ceiling for ${method.label}. ` +
      `Remove ${spec.inks.length - ceiling} or switch method.`))
  }
  if (spec.inks.length === 0) {
    issues.push(err('inks', 'At least one ink colour is required.'))
  }
  if (method.id === 'screen' && spec.inks.length >= 5) {
    issues.push(warn('inks',
      `${spec.inks.length} screens means ${spec.inks.length} setups — check the unit economics at your run size.`))
  }

  // --- Gradients
  if (spec.useGradients && !method.gradients) {
    issues.push(err('useGradients',
      `${method.label} cannot print smooth gradients. Turn gradients off, or let the composer halftone them.`))
  }

  // --- Sublimation cannot print white or lighten a dark garment
  if (method.requiresLightGarment && garmentColour.dark) {
    issues.push(err('printMethod',
      `${method.label} only works on white or very light garments — ${garmentColour.label} will not take it.`))
  }

  // --- Complexity against what the method can hold
  if (spec.complexity > method.maxComplexity) {
    issues.push(warn('complexity',
      `Detail level ${spec.complexity} is beyond what ${method.label} reliably holds ` +
      `(max ${method.maxComplexity}). Fine detail will fill in or lift.`))
  }

  // --- Ink separation against the garment
  for (const ink of spec.inks) {
    const sep = inkSeparation(ink, garmentColour.hex)
    if (!sep.ok) {
      issues.push(warn('inks',
        `${ink.toUpperCase()} sits ΔE ${sep.deltaE.toFixed(1)} from ${garmentColour.label} ` +
        `(needs ${INK_SEPARATION_MIN}+) — it will barely read on the fabric.`))
    }
  }

  // --- Typography
  if (spec.textTreatment !== 'none' && !spec.headline.trim()) {
    issues.push(warn('headline', 'A text treatment is set but there is no headline copy.'))
  }
  if (spec.textTreatment === 'none' && spec.headline.trim()) {
    issues.push(warn('textTreatment', 'Headline copy is set but the text treatment is “No text”.'))
  }

  // --- Concept
  if (!spec.theme.trim()) {
    issues.push(err('theme', 'A theme is needed — it is the subject the whole brief hangs on.'))
  }
  if (!spec.styles.length) issues.push(err('styles', 'Pick at least one style.'))
  if (!spec.feels.length) issues.push(warn('feels', 'No mood selected — the brief will read flat.'))

  return issues
}

export const errorsOf = (issues) => issues.filter((i) => i.level === 'error')
export const warningsOf = (issues) => issues.filter((i) => i.level === 'warn')

// The structured brief. This is what the Gemini function will receive, and what
// the SVG composer consumes — so it is also useful on its own, copied into any
// other image tool.
export function buildBrief(spec, { garmentId, colourId, placements, size, perSizeScaling }) {
  const garment = GARMENTS_BY_ID[garmentId]
  const method = METHODS_BY_ID[spec.printMethod]
  const colour = COLOURS_BY_ID[colourId]

  return {
    seed: spec.seed,
    concept: {
      theme: spec.theme.trim(),
      niche: spec.niche.trim() || null,
      audience: spec.audience.trim() || null,
      occasion: spec.occasion
    },
    style: {
      styles: spec.styles,
      feels: spec.feels,
      complexity: spec.complexity,
      era: spec.era === 'none' ? null : spec.era,
      layout: spec.layout === 'auto' ? null : spec.layout
    },
    typography: spec.textTreatment === 'none' ? null : {
      headline: spec.headline.trim() || null,
      subline: spec.subline.trim() || null,
      treatment: spec.textTreatment,
      fontPairing: spec.fontPairing
    },
    colour: {
      garment: { id: colour.id, label: colour.label, hex: colour.hex, dark: colour.dark },
      inks: spec.inks,
      maxColours: method.maxColours,
      gradients: spec.useGradients && method.gradients
    },
    production: {
      method: method.id,
      minStrokeIn: method.minStrokeIn,
      garment: { id: garment.id, label: garment.label },
      size,
      perSizeScaling: Boolean(perSizeScaling),
      placements: placements.map((id) => {
        const a = garment.print[id]
        return { id, label: PLACEMENTS[id].label, widthIn: a.w, heightIn: a.h, dpi: 300 }
      })
    },
    variations: spec.variations
  }
}

// A human-readable version of the same brief, for pasting into any other tool.
export function briefToPrompt(brief, { styleLabels, feelLabels }) {
  const c = brief.concept, s = brief.style, t = brief.typography, col = brief.colour, p = brief.production
  const lines = []

  lines.push(`Apparel graphic for a ${p.garment.label.toLowerCase()} in ${col.garment.label.toLowerCase()}.`)
  lines.push(`Subject: ${c.theme}.`)
  if (c.niche) lines.push(`Niche: ${c.niche}.`)
  if (c.audience) lines.push(`Audience: ${c.audience}.`)
  lines.push(`Occasion: ${c.occasion}.`)
  lines.push('')
  lines.push(`Style: ${styleLabels.join(', ')}.`)
  lines.push(`Mood: ${feelLabels.join(', ')}.`)
  lines.push(`Detail level: ${s.complexity} of 5.`)
  if (s.era) lines.push(`Era cue: ${s.era}.`)
  if (s.layout) lines.push(`Layout: ${s.layout.replace(/_/g, ' ')}.`)
  lines.push('')
  if (t) {
    if (t.headline) lines.push(`Headline copy: "${t.headline}".`)
    if (t.subline) lines.push(`Secondary copy: "${t.subline}".`)
    lines.push(`Text treatment: ${t.treatment}. Type pairing: ${t.fontPairing.replace(/_/g, ' / ')}.`)
  } else {
    lines.push('No text — the graphic carries the whole idea.')
  }
  lines.push('')
  lines.push(`Ink palette (${col.inks.length}): ${col.inks.join(', ')}.`)
  lines.push(`Printed on ${col.garment.hex} fabric — every ink must read against that ground.`)
  lines.push('')
  lines.push('Production constraints — these are hard requirements, not preferences:')
  lines.push(`- Print method: ${p.method}. ${col.maxColours ? `Maximum ${col.maxColours} flat colours.` : 'Unlimited colours.'}`)
  lines.push(`- ${col.gradients ? 'Gradients allowed.' : 'No gradients — flat fills only.'}`)
  lines.push(`- No stroke thinner than ${p.minStrokeIn}in at final print size.`)
  lines.push('- Transparent background. No garment, no mockup, no shadow, artwork only.')
  lines.push(`- Output at 300 DPI, sized exactly per placement:`)
  for (const pl of p.placements) lines.push(`  · ${pl.label}: ${pl.widthIn}in × ${pl.heightIn}in`)
  lines.push('')
  lines.push(`Seed: ${brief.seed}`)
  return lines.join('\n')
}
