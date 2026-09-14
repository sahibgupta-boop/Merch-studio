import { esc } from './svgUtil.js'

// Procedural motifs. Each returns SVG markup inside the given box. They are
// abstract by design: geometry the composer can scale and recolour safely, with
// no stroke ever thinner than the print method allows.

const R = (n) => Math.round(n * 100) / 100

export const MOTIFS = {
  sunburst: (b, c, rng, minStroke) => {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2
    const rays = rng.int(10, 18)
    const rOuter = Math.min(b.w, b.h) / 2
    const parts = []
    for (let i = 0; i < rays; i++) {
      const a0 = (i / rays) * Math.PI * 2
      const a1 = a0 + (Math.PI * 2) / rays / 2
      parts.push(`<path d="M ${R(cx)} ${R(cy)} L ${R(cx + Math.cos(a0) * rOuter)} ${R(cy + Math.sin(a0) * rOuter)} L ${R(cx + Math.cos(a1) * rOuter)} ${R(cy + Math.sin(a1) * rOuter)} Z" fill="${c.secondary}"/>`)
    }
    parts.push(`<circle cx="${R(cx)}" cy="${R(cy)}" r="${R(rOuter * 0.42)}" fill="${c.accent}"/>`)
    return parts.join('')
  },

  mountains: (b, c, rng, minStroke) => {
    const base = b.y + b.h * 0.86
    const peaks = rng.int(2, 4)
    const parts = []
    for (let i = 0; i < peaks; i++) {
      const w = b.w / peaks
      const x = b.x + i * w
      const h = b.h * rng.range(0.45, 0.95)
      parts.push(`<path d="M ${R(x - w * 0.15)} ${R(base)} L ${R(x + w / 2)} ${R(base - h)} L ${R(x + w * 1.15)} ${R(base)} Z" fill="${i % 2 ? c.secondary : c.accent}"/>`)
    }
    parts.push(`<rect x="${R(b.x)}" y="${R(base)}" width="${R(b.w)}" height="${R(Math.max(minStroke, b.h * 0.03))}" fill="${c.primary}"/>`)
    return parts.join('')
  },

  arcBands: (b, c, rng, minStroke) => {
    const cx = b.x + b.w / 2, cy = b.y + b.h
    const bands = rng.int(3, 5)
    const parts = []
    for (let i = 0; i < bands; i++) {
      const r = (b.h * (i + 1)) / bands
      const t = Math.max(minStroke, b.h / (bands * 3))
      parts.push(`<path d="M ${R(cx - r)} ${R(cy)} A ${R(r)} ${R(r)} 0 0 1 ${R(cx + r)} ${R(cy)}" fill="none" stroke="${i % 2 ? c.secondary : c.accent}" stroke-width="${R(t)}"/>`)
    }
    return parts.join('')
  },

  rings: (b, c, rng, minStroke) => {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2
    const n = rng.int(3, 6)
    const rMax = Math.min(b.w, b.h) / 2
    const parts = []
    for (let i = n; i > 0; i--) {
      const r = (rMax * i) / n
      parts.push(`<circle cx="${R(cx)}" cy="${R(cy)}" r="${R(r)}" fill="none" stroke="${i % 2 ? c.secondary : c.accent}" stroke-width="${R(Math.max(minStroke, rMax / (n * 2.4)))}"/>`)
    }
    return parts.join('')
  },

  waves: (b, c, rng, minStroke) => {
    const lines = rng.int(4, 7)
    const parts = []
    for (let i = 0; i < lines; i++) {
      const y = b.y + (b.h * (i + 0.5)) / lines
      const amp = b.h / (lines * 1.6)
      let d = `M ${R(b.x)} ${R(y)}`
      const steps = 4
      for (let s = 0; s < steps; s++) {
        const x1 = b.x + (b.w * (s + 0.5)) / steps
        const x2 = b.x + (b.w * (s + 1)) / steps
        d += ` Q ${R(x1)} ${R(y + (s % 2 ? amp : -amp))} ${R(x2)} ${R(y)}`
      }
      parts.push(`<path d="${d}" fill="none" stroke="${i % 2 ? c.secondary : c.accent}" stroke-width="${R(Math.max(minStroke, amp * 0.45))}" stroke-linecap="round"/>`)
    }
    return parts.join('')
  },

  lattice: (b, c, rng, minStroke) => {
    const cols = rng.int(3, 6), rows = Math.max(2, Math.round((cols * b.h) / b.w))
    const parts = []
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        const w = b.w / cols, h = b.h / rows
        const x = b.x + q * w + w / 2, y = b.y + r * h + h / 2
        const s = Math.min(w, h) * 0.34
        parts.push(`<path d="M ${R(x)} ${R(y - s)} L ${R(x + s)} ${R(y)} L ${R(x)} ${R(y + s)} L ${R(x - s)} ${R(y)} Z" fill="${(r + q) % 2 ? c.secondary : c.accent}"/>`)
      }
    }
    return parts.join('')
  },

  halftoneBlock: (b, c, rng, minStroke) => {
    const cols = rng.int(7, 12)
    const rows = Math.max(3, Math.round((cols * b.h) / b.w))
    const parts = []
    const cell = Math.min(b.w / cols, b.h / rows)
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        const t = 1 - r / rows
        const rad = Math.max(minStroke / 2, cell * 0.46 * t)
        if (rad < minStroke / 2) continue
        parts.push(`<circle cx="${R(b.x + q * cell + cell / 2)}" cy="${R(b.y + r * cell + cell / 2)}" r="${R(rad)}" fill="${c.secondary}"/>`)
      }
    }
    return parts.join('')
  },

  starburst: (b, c, rng, minStroke) => {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2
    const pts = rng.int(5, 9)
    const rO = Math.min(b.w, b.h) / 2, rI = rO * rng.range(0.36, 0.52)
    let d = ''
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 ? rI : rO
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2
      d += `${i ? 'L' : 'M'} ${R(cx + Math.cos(a) * r)} ${R(cy + Math.sin(a) * r)} `
    }
    return `<path d="${d}Z" fill="${c.secondary}"/>`
  }
}

// Which motifs suit which styles. Falls back to the full set.
const STYLE_MOTIFS = {
  retro_70s: ['sunburst', 'arcBands', 'rings'],
  y2k: ['starburst', 'rings', 'lattice'],
  psychedelic: ['waves', 'sunburst', 'rings'],
  ukiyo: ['waves', 'mountains', 'arcBands'],
  halftone_comic: ['halftoneBlock', 'starburst'],
  grunge_photocopy: ['halftoneBlock', 'lattice'],
  bauhaus: ['lattice', 'rings', 'starburst'],
  vector_flat: ['mountains', 'rings', 'lattice'],
  line_art: ['rings', 'waves', 'arcBands'],
  minimal_type: ['rings', 'arcBands'],
  collegiate: ['starburst', 'arcBands'],
  western: ['mountains', 'starburst', 'sunburst'],
  cyberpunk: ['lattice', 'halftoneBlock', 'waves'],
  mascot: ['starburst', 'sunburst'],
  vintage_distressed: ['sunburst', 'mountains', 'arcBands'],
  blackwork: ['rings', 'starburst', 'lattice'],
  graffiti: ['starburst', 'lattice'],
  anime: ['starburst', 'sunburst', 'halftoneBlock']
}

export function pickMotif(styles, rng) {
  const pool = styles.flatMap((s) => STYLE_MOTIFS[s] || [])
  const names = pool.length ? pool : Object.keys(MOTIFS)
  return rng.pick(names)
}
