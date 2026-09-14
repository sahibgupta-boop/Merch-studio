import { makeRng } from './rng.js'
import { MOTIFS, pickMotif } from './motifs.js'
import { esc, round as R } from './svgUtil.js'
import { deltaE2000 } from './colour.js'
import { FONT_PAIRINGS } from './../data/vocabularies.js'
import { METHODS_BY_ID } from '../data/printMethods.js'

// Artwork coordinate space: 100 units per inch. Everything is authored at true
// physical size, so exporting at 300 DPI is a pure scale — no re-layout, no
// resampling decisions, no drift between what is previewed and what is printed.
export const ART_UPI = 100
const SAFE_MARGIN_IN = 0.25

// Text is fitted with textLength + lengthAdjust rather than by measuring glyphs.
// That guarantees a line occupies exactly the width the layout allocated, whatever
// font the renderer resolves — so the composition can never overflow its print area.
function fittedText(str, { x, y, width, size, fill, family, weight = '700', anchor = 'middle', letterSpacing = 0, opacity }) {
  if (!str) return ''
  return `<text x="${R(x)}" y="${R(y)}" font-family="${esc(family)}" font-size="${R(size)}" ` +
    `font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ` +
    `textLength="${R(width)}" lengthAdjust="spacingAndGlyphs"` +
    (letterSpacing ? ` letter-spacing="${R(letterSpacing)}"` : '') +
    (opacity != null ? ` opacity="${opacity}"` : '') +
    `>${esc(str)}</text>`
}

// An arc placed naively runs its glyphs outside the print area: the text sits above
// the baseline, so the arc's apex has to leave a cap-height of clearance. Radius is
// clamped to the box in both axes and the run is length-fitted to the arc.
function safeArc(box, size) {
  const clearance = size * 0.82
  // 0.94 keeps the arc's ends off the edge so the first and last glyph breathe.
  const r = Math.max(8, Math.min((box.w / 2) * 0.94, box.h - clearance))
  return { cx: box.x + box.w / 2, cy: box.y + clearance + r, r }
}

function arcedText(str, { cx, cy, r, size, fill, family, id, sweep = 1 }) {
  if (!str) return ''
  const d = sweep
    ? `M ${R(cx - r)} ${R(cy)} A ${R(r)} ${R(r)} 0 0 1 ${R(cx + r)} ${R(cy)}`
    : `M ${R(cx - r)} ${R(cy)} A ${R(r)} ${R(r)} 0 0 0 ${R(cx + r)} ${R(cy)}`
  const arcLen = Math.PI * r * 0.88
  return `<defs><path id="${id}" d="${d}" fill="none"/></defs>` +
    `<text font-family="${esc(family)}" font-size="${R(size)}" font-weight="700" fill="${fill}">` +
    `<textPath href="#${id}" startOffset="50%" text-anchor="middle" ` +
    `textLength="${R(arcLen)}" lengthAdjust="spacingAndGlyphs">${esc(str)}</textPath></text>`
}

// Ink roles are assigned by perceptual distance from the garment, so the most
// readable ink always carries the headline rather than whichever happened to be first.
function assignInkRoles(inks, garmentHex) {
  const ranked = [...inks].sort((a, b) => deltaE2000(b, garmentHex) - deltaE2000(a, garmentHex))
  return {
    primary: ranked[0],
    secondary: ranked[1] || ranked[0],
    accent: ranked[2] || ranked[1] || ranked[0],
    all: ranked
  }
}

function chooseLayout(requested, wIn, hIn, rng) {
  if (requested) return requested
  const ratio = wIn / hIn
  if (ratio > 2.6) return 'yoke_strip'
  if (ratio < 0.45) return 'sleeve_strip'
  if (Math.max(wIn, hIn) <= 4.5) return rng.pick(['lockup', 'badge'])
  return rng.pick(['centred_stack', 'arched_over_motif', 'badge', 'poster'])
}

// A speckle mask, used only for the distressed and photocopy styles. Applied as a
// mask rather than painted specks so it knocks holes in the ink exactly like a
// worn print, instead of adding a colour the separation would have to account for.
function distressMask(id, w, h, rng, density) {
  const specks = []
  const n = Math.round(density * (w * h) / 4000)
  for (let i = 0; i < n; i++) {
    const x = rng.range(0, w), y = rng.range(0, h)
    const s = rng.range(1.5, 9)
    specks.push(rng.chance(0.5)
      ? `<circle cx="${R(x)}" cy="${R(y)}" r="${R(s / 2)}" fill="black"/>`
      : `<rect x="${R(x)}" y="${R(y)}" width="${R(s)}" height="${R(s * rng.range(0.3, 1))}" fill="black" transform="rotate(${R(rng.range(0, 90))} ${R(x)} ${R(y)})"/>`)
  }
  return `<mask id="${id}"><rect width="${R(w)}" height="${R(h)}" fill="white"/>${specks.join('')}</mask>`
}

export function composeArtwork(brief, placementId) {
  const placement = brief.production.placements.find((p) => p.id === placementId)
  if (!placement) return null

  const wIn = placement.widthIn, hIn = placement.heightIn
  const W = wIn * ART_UPI, H = hIn * ART_UPI
  const margin = SAFE_MARGIN_IN * ART_UPI
  const inner = { x: margin, y: margin, w: W - margin * 2, h: H - margin * 2 }

  // Seed per placement so every area of one design differs but stays reproducible.
  const rng = makeRng(`${brief.seed}:${placementId}`)
  const method = METHODS_BY_ID[brief.production.method]
  const minStroke = method.minStrokeIn * ART_UPI

  const c = assignInkRoles(brief.colour.inks, brief.colour.garment.hex)
  const pairing = FONT_PAIRINGS.find((f) => f.id === brief.typography?.fontPairing) || FONT_PAIRINGS[0]
  const displayFont = `${pairing.display}, Impact, sans-serif`
  const bodyFont = `${pairing.body}, Helvetica, sans-serif`

  const t = brief.typography
  const headline = t?.headline || ''
  const subline = t?.subline || ''
  const treatment = t?.treatment || 'none'
  const layout = chooseLayout(brief.style.layout, wIn, hIn, rng)
  const motifName = pickMotif(brief.style.styles, rng)
  const motif = MOTIFS[motifName]

  const styles = brief.style.styles
  const distressed = styles.includes('vintage_distressed') || styles.includes('grunge_photocopy')
  const outlineOnly = treatment === 'outline'

  const body = []
  const uid = `a${String(brief.seed).replace(/[^a-z0-9]/gi, '')}${placementId.replace(/_/g, '')}`

  const drawHeadline = (box, { size, lines }) => {
    const out = []
    const rows = lines ?? (headline.split(' ').length > 3 && treatment === 'stacked'
      ? chunkWords(headline, 2) : [headline])
    const lineH = box.h / rows.length
    rows.forEach((line, i) => {
      const fs = size ?? lineH * 0.82
      const y = box.y + lineH * (i + 0.82)
      if (treatment === 'arched' && rows.length === 1) {
        const a = safeArc(box, fs)
        out.push(arcedText(line, {
          ...a, size: fs, fill: c.primary, family: displayFont, id: `${uid}arc${i}`
        }))
      } else if (outlineOnly) {
        out.push(`<g fill="none" stroke="${c.primary}" stroke-width="${R(Math.max(minStroke, fs * 0.045))}">` +
          fittedText(line, { x: box.x + box.w / 2, y, width: box.w, size: fs, fill: 'none', family: displayFont }) +
          `</g>`)
      } else {
        const skew = treatment === 'warped' ? rng.range(-7, 7) : 0
        const g = fittedText(line, { x: box.x + box.w / 2, y, width: box.w, size: fs, fill: c.primary, family: displayFont })
        out.push(skew ? `<g transform="skewX(${R(skew)})">${g}</g>` : g)
      }
    })
    return out.join('')
  }

  // ---------------------------------------------------------------- layouts
  if (layout === 'centred_stack') {
    const motifBox = { x: inner.x + inner.w * 0.16, y: inner.y, w: inner.w * 0.68, h: inner.h * 0.46 }
    body.push(motif(motifBox, c, rng, minStroke))
    body.push(drawHeadline({ x: inner.x, y: inner.y + inner.h * 0.52, w: inner.w, h: inner.h * 0.3 }, {}))
    if (subline) {
      const ry = inner.y + inner.h * 0.86
      body.push(`<rect x="${R(inner.x + inner.w * 0.2)}" y="${R(ry - inner.h * 0.045)}" width="${R(inner.w * 0.6)}" height="${R(Math.max(minStroke, inner.h * 0.008))}" fill="${c.accent}"/>`)
      body.push(fittedText(subline, { x: inner.x + inner.w / 2, y: ry + inner.h * 0.06, width: inner.w * 0.56, size: inner.h * 0.055, fill: c.accent, family: bodyFont, weight: '600' }))
    }
  } else if (layout === 'arched_over_motif') {
    const headSize = inner.h * 0.14
    const headBox = { x: inner.x, y: inner.y, w: inner.w, h: inner.h * 0.44 }
    body.push(arcedText(headline, {
      ...safeArc(headBox, headSize),
      size: headSize, fill: c.primary, family: displayFont, id: `${uid}top`
    }))
    body.push(motif({ x: inner.x + inner.w * 0.2, y: inner.y + inner.h * 0.36, w: inner.w * 0.6, h: inner.h * 0.42 }, c, rng, minStroke))
    if (subline) {
      body.push(fittedText(subline, { x: inner.x + inner.w / 2, y: inner.y + inner.h * 0.94, width: inner.w * 0.7, size: inner.h * 0.07, fill: c.accent, family: bodyFont }))
    }
  } else if (layout === 'badge') {
    const r = Math.min(inner.w, inner.h) / 2
    const cx = inner.x + inner.w / 2, cy = inner.y + inner.h / 2
    body.push(`<circle cx="${R(cx)}" cy="${R(cy)}" r="${R(r)}" fill="none" stroke="${c.primary}" stroke-width="${R(Math.max(minStroke, r * 0.05))}"/>`)
    body.push(`<circle cx="${R(cx)}" cy="${R(cy)}" r="${R(r * 0.88)}" fill="none" stroke="${c.accent}" stroke-width="${R(Math.max(minStroke, r * 0.016))}"/>`)
    body.push(motif({ x: cx - r * 0.46, y: cy - r * 0.52, w: r * 0.92, h: r * 0.72 }, c, rng, minStroke))
    body.push(fittedText(headline, { x: cx, y: cy + r * 0.46, width: r * 1.3, size: r * 0.24, fill: c.primary, family: displayFont }))
    if (subline) body.push(fittedText(subline, { x: cx, y: cy + r * 0.68, width: r * 0.95, size: r * 0.12, fill: c.accent, family: bodyFont, weight: '600' }))
  } else if (layout === 'poster') {
    const rows = chunkWords(headline, 2)
    const lineH = inner.h * 0.62 / Math.max(rows.length, 1)
    body.push(`<g opacity="0.9">${motif({ x: inner.x, y: inner.y + inner.h * 0.1, w: inner.w, h: inner.h * 0.8 }, c, rng, minStroke)}</g>`)
    rows.forEach((line, i) => {
      body.push(fittedText(line, {
        x: inner.x + inner.w / 2, y: inner.y + inner.h * 0.24 + lineH * (i + 0.8),
        width: inner.w, size: lineH * 0.86, fill: c.primary, family: displayFont
      }))
    })
    if (subline) body.push(fittedText(subline, { x: inner.x + inner.w / 2, y: inner.y + inner.h * 0.96, width: inner.w * 0.62, size: inner.h * 0.06, fill: c.accent, family: bodyFont }))
  } else if (layout === 'lockup') {
    const markH = inner.h * 0.46
    body.push(motif({ x: inner.x + inner.w * 0.3, y: inner.y, w: inner.w * 0.4, h: markH }, c, rng, minStroke))
    body.push(fittedText(headline, { x: inner.x + inner.w / 2, y: inner.y + markH + inner.h * 0.28, width: inner.w * 0.94, size: inner.h * 0.24, fill: c.primary, family: displayFont }))
    if (subline) body.push(fittedText(subline, { x: inner.x + inner.w / 2, y: inner.y + inner.h * 0.95, width: inner.w * 0.7, size: inner.h * 0.12, fill: c.accent, family: bodyFont }))
  } else if (layout === 'yoke_strip') {
    body.push(fittedText(headline, { x: inner.x + inner.w / 2, y: inner.y + inner.h * 0.72, width: inner.w, size: inner.h * 0.78, fill: c.primary, family: displayFont, letterSpacing: inner.h * 0.04 }))
  } else if (layout === 'sleeve_strip') {
    const cx = inner.x + inner.w / 2, cy = inner.y + inner.h / 2
    body.push(`<g transform="rotate(-90 ${R(cx)} ${R(cy)})">` +
      fittedText(headline, { x: cx, y: cy + inner.w * 0.3, width: inner.h * 0.92, size: inner.w * 0.6, fill: c.primary, family: displayFont }) +
      `</g>`)
  }

  const masked = distressed
    ? `${distressMask(`${uid}d`, W, H, rng, styles.includes('grunge_photocopy') ? 2.4 : 1.2)}<g mask="url(#${uid}d)">${body.join('')}</g>`
    : body.join('')

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${R(W)} ${R(H)}" width="${R(W)}" height="${R(H)}">` +
    `<title>${esc(brief.concept.theme)} — ${esc(placement.label)}</title>` +
    `<desc>seed ${esc(brief.seed)} · ${esc(layout)} · ${esc(motifName)} · ${wIn}in x ${hIn}in at 300 DPI</desc>` +
    masked + `</svg>`

  return {
    svg, widthIn: wIn, heightIn: hIn, layout, motif: motifName,
    inkRoles: c, placement, pxWidth: Math.round(wIn * 300), pxHeight: Math.round(hIn * 300)
  }
}

function chunkWords(str, perLine) {
  const words = String(str).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const out = []
  for (let i = 0; i < words.length; i += perLine) out.push(words.slice(i, i + perLine).join(' '))
  return out
}

export const composeAll = (brief) =>
  brief.production.placements.map((p) => composeArtwork(brief, p.id)).filter(Boolean)
