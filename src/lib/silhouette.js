import { SIZE_CHARTS, REFERENCE_SIZE } from '../data/sizeCharts.js'

// Parametric garment silhouettes. Geometry is derived from the garment's own size
// chart rather than hand-drawn, so the preview is genuinely to scale: at a fixed
// units-per-inch the garment grows with the selected size while a print area,
// drawn at the same scale, stays the same physical size. That size relationship
// is the thing a seller needs to see before committing artwork.

export const VIEW = { w: 260, h: 300 }
export const CX = 130
export const SHOULDER_Y = 62
export const UPI = 5 // SVG units per inch

const FIT = {
  slim:      { shoulderFactor: 0.95, chestFactor: 0.96, hemFactor: 0.93, armpitDrop: 8.0 },
  regular:   { shoulderFactor: 1.0,  chestFactor: 1.0,  hemFactor: 0.98, armpitDrop: 8.5 },
  boxy:      { shoulderFactor: 1.0,  chestFactor: 1.0,  hemFactor: 1.0,  armpitDrop: 9.0 },
  oversized: { shoulderFactor: 1.0,  chestFactor: 1.0,  hemFactor: 0.99, armpitDrop: 10.5 },
  tank:      { shoulderFactor: 1.0,  chestFactor: 1.0,  hemFactor: 0.97, armpitDrop: 7.5 }
}

// Sleeve reach in inches. `out`/`down` place the outer cuff corner relative to the
// shoulder tip; `innerOut`/`innerDown` place the inner cuff corner relative to the
// CHEST edge, because the underarm seam runs from the armpit outward — anchoring it
// to the shoulder instead inverts the sleeve on any garment whose chest is wider
// than its shoulders, which is most of them.
const SLEEVE = {
  short:        { out: 2.6, down: 8.2,  innerOut: 0.3, innerDown: 10.2 },
  threequarter: { out: 3.6, down: 15.5, innerOut: 0.8, innerDown: 17.2 },
  long:         { out: 4.4, down: 24.0, innerOut: 0.9, innerDown: 25.6 },
  none:         null
}

// Resolved cuff corners for a garment at a size, shared by the outline and the cuff
// ribbing so the two can never drift apart.
export function sleeveCorners(sleeve, shoulderHalf, chestHalf) {
  if (!sleeve) return null
  return {
    outX: shoulderHalf + sleeve.out * UPI,
    outY: SHOULDER_Y + sleeve.down * UPI,
    inX: chestHalf + sleeve.innerOut * UPI,
    inY: SHOULDER_Y + sleeve.innerDown * UPI
  }
}

const NECK = {
  crew:       { half: 3.9, drop: 2.5 },
  v:          { half: 3.7, drop: 7.0 },
  scoop:      { half: 4.6, drop: 4.2 },
  henley:     { half: 3.5, drop: 2.4 },
  polo:       { half: 3.4, drop: 1.8 },
  mandarin:   { half: 3.3, drop: 1.4 },
  shirt:      { half: 3.4, drop: 1.6 },
  camp:       { half: 3.6, drop: 2.0 },
  hood:       { half: 4.2, drop: 2.8 },
  zipHood:    { half: 4.2, drop: 2.8 },
  quarterZip: { half: 3.5, drop: 1.8 }
}

const n = (v) => Math.round(v * 100) / 100

export function garmentMetrics(garment, size = REFERENCE_SIZE) {
  const chart = SIZE_CHARTS[garment.chart]
  const row = chart.rows[size] || chart.rows[REFERENCE_SIZE]
  const fit = FIT[garment.silhouette.fit] || FIT.regular

  // Flat (laid-out) half-widths. Chest circumference halves to a flat width,
  // which halves again to a half-width from the centre line.
  const chestHalf = (row.chest / 4) * UPI * fit.chestFactor
  const shoulderHalf = (row.shoulder / 2) * UPI * fit.shoulderFactor
  const hemHalf = chestHalf * fit.hemFactor
  const bodyLength = row.length * UPI
  const hemY = SHOULDER_Y + bodyLength
  const armpitY = SHOULDER_Y + fit.armpitDrop * UPI

  return { row, chart, chestHalf, shoulderHalf, hemHalf, bodyLength, hemY, armpitY, fit, upi: UPI }
}

function necklineSegment(neckline, nh, drop) {
  // Travels from the right neck point back to the left neck point, closing the body.
  const sy = SHOULDER_Y
  if (neckline === 'v') return `L ${n(CX)} ${n(sy + drop)} L ${n(CX - nh)} ${n(sy)}`
  return `Q ${n(CX)} ${n(sy + drop * 2)} ${n(CX - nh)} ${n(sy)}`
}

// Body outline. Drawn anticlockwise from the left neck point.
export function bodyPath(garment, size, view = 'front') {
  const m = garmentMetrics(garment, size)
  const { chestHalf, shoulderHalf, hemHalf, hemY, armpitY } = m
  const sil = garment.silhouette
  const sleeve = SLEEVE[sil.sleeve]
  const neckKey = view === 'back' ? (sil.neckline === 'hood' || sil.neckline === 'zipHood' ? 'hood' : 'crew') : sil.neckline
  const neck = NECK[neckKey] || NECK.crew
  const nh = neck.half * UPI
  const drop = (view === 'back' ? Math.min(neck.drop, 1.6) : neck.drop) * UPI

  const sy = SHOULDER_Y
  const tipY = sy + 1.6 * UPI
  const L = (x) => CX - x
  const R = (x) => CX + x

  let d = `M ${n(L(nh))} ${n(sy)} L ${n(L(shoulderHalf))} ${n(tipY)} `

  const c = sleeveCorners(sleeve, shoulderHalf, chestHalf)
  if (c) {
    d += `L ${n(L(c.outX))} ${n(c.outY)} L ${n(L(c.inX))} ${n(c.inY)} L ${n(L(chestHalf))} ${n(armpitY)} `
  } else {
    // Sleeveless: the armhole scoops from a narrow strap out to the chest.
    d += `Q ${n(L(shoulderHalf + 4))} ${n(armpitY - 14)} ${n(L(chestHalf))} ${n(armpitY)} `
  }

  d += `L ${n(L(hemHalf))} ${n(hemY)} L ${n(R(hemHalf))} ${n(hemY)} L ${n(R(chestHalf))} ${n(armpitY)} `

  if (c) {
    d += `L ${n(R(c.inX))} ${n(c.inY)} L ${n(R(c.outX))} ${n(c.outY)} `
  } else {
    d += `Q ${n(R(shoulderHalf + 4))} ${n(armpitY - 14)} ${n(R(shoulderHalf))} ${n(tipY)} `
  }

  d += `L ${n(R(shoulderHalf))} ${n(tipY)} L ${n(R(nh))} ${n(sy)} `
  d += necklineSegment(neckKey, nh, drop)
  return d + 'Z'
}

// Construction details drawn over (or behind) the body: collars, plackets, zips,
// pockets, hoods, cuffs. Returned as plain descriptors the component renders.
export function detailShapes(garment, size, view = 'front') {
  const m = garmentMetrics(garment, size)
  const { chestHalf, shoulderHalf, hemY, armpitY } = m
  const sil = garment.silhouette
  const d = sil.details || []
  const sy = SHOULDER_Y
  const neck = NECK[sil.neckline] || NECK.crew
  const nh = neck.half * UPI
  const behind = []
  const front = []

  const hooded = sil.neckline === 'hood' || sil.neckline === 'zipHood'
  if (hooded) {
    // Anchored wide and low so the hood reads as attached behind the shoulders
    // rather than floating above the neck.
    const baseHalf = nh + 3.2 * UPI
    const topHalf = baseHalf * 0.88
    const baseY = sy + 1.4 * UPI
    const topY = sy - 7.5 * UPI
    behind.push({ type: 'path', key: 'hood', d:
      `M ${n(CX - baseHalf)} ${n(baseY)} ` +
      `C ${n(CX - baseHalf - 3)} ${n(topY + 5.2 * UPI)} ${n(CX - topHalf)} ${n(topY)} ${n(CX)} ${n(topY)} ` +
      `C ${n(CX + topHalf)} ${n(topY)} ${n(CX + baseHalf + 3)} ${n(topY + 5.2 * UPI)} ${n(CX + baseHalf)} ${n(baseY)} Z` })
    if (view === 'front') {
      front.push({ type: 'path', key: 'hoodInner', d:
        `M ${n(CX - nh)} ${n(sy + 2)} Q ${n(CX)} ${n(sy + neck.drop * 2 * UPI)} ${n(CX + nh)} ${n(sy + 2)}`, fill: 'none' })
    }
  }

  if (view === 'front') {
    const collarY = sy + 1.5 * UPI
    if (sil.neckline === 'polo' || sil.neckline === 'shirt' || sil.neckline === 'camp') {
      const spread = sil.neckline === 'camp' ? 4.4 : 3.6
      const pointY = collarY + (sil.neckline === 'camp' ? 3.6 : 3.0) * UPI
      front.push({ type: 'path', key: 'collarL', d:
        `M ${n(CX - nh - 2)} ${n(sy)} L ${n(CX - nh - spread * UPI)} ${n(collarY)} L ${n(CX - 2)} ${n(pointY)} L ${n(CX - 2)} ${n(sy + 1.2 * UPI)} Z` })
      front.push({ type: 'path', key: 'collarR', d:
        `M ${n(CX + nh + 2)} ${n(sy)} L ${n(CX + nh + spread * UPI)} ${n(collarY)} L ${n(CX + 2)} ${n(pointY)} L ${n(CX + 2)} ${n(sy + 1.2 * UPI)} Z` })
    }
    if (sil.neckline === 'mandarin') {
      front.push({ type: 'path', key: 'band', d:
        `M ${n(CX - nh - 1)} ${n(sy)} L ${n(CX - nh - 1)} ${n(sy - 1.5 * UPI)} L ${n(CX + nh + 1)} ${n(sy - 1.5 * UPI)} L ${n(CX + nh + 1)} ${n(sy)} Z` })
    }
    if (sil.neckline === 'quarterZip') {
      front.push({ type: 'path', key: 'zipBand', d:
        `M ${n(CX - nh - 1)} ${n(sy)} L ${n(CX - nh - 1)} ${n(sy - 2 * UPI)} L ${n(CX + nh + 1)} ${n(sy - 2 * UPI)} L ${n(CX + nh + 1)} ${n(sy)} Z` })
    }

    // Plackets and zips — the features that block centre-front printing.
    const placketW = 1.5 * UPI
    if (d.includes('placket')) {
      const full = ['shirt', 'camp'].includes(sil.neckline) || garment.group === 'shirts' || sil.neckline === 'mandarin'
      const end = full ? hemY : sy + 8.5 * UPI
      front.push({ type: 'rect', key: 'placket', x: n(CX - placketW / 2), y: n(sy), w: n(placketW), h: n(end - sy), fill: 'none' })
    }
    if (d.includes('zipQuarter')) {
      front.push({ type: 'line', key: 'zipq', x1: CX, y1: n(sy - 2 * UPI), x2: CX, y2: n(sy + 8 * UPI), dash: '3 2' })
    }
    if (d.includes('zipFull')) {
      front.push({ type: 'line', key: 'zipf', x1: CX, y1: n(sy - (hooded ? 1 : 1.5) * UPI), x2: CX, y2: n(hemY), dash: '3 2' })
    }
    if (d.includes('buttons')) {
      const full = garment.group === 'shirts' || sil.neckline === 'mandarin'
      const count = full ? 6 : 3
      const step = full ? (hemY - sy - 3 * UPI) / count : 1.9 * UPI
      for (let i = 0; i < count; i++) {
        front.push({ type: 'circle', key: `btn${i}`, cx: CX, cy: n(sy + 2.2 * UPI + i * step), r: 1.8 })
      }
    }
    if (d.includes('pocketKangaroo')) {
      const pw = chestHalf * 0.82
      const pTop = hemY - 8.5 * UPI
      front.push({ type: 'path', key: 'kangaroo', d:
        `M ${n(CX - pw)} ${n(pTop + 2.2 * UPI)} L ${n(CX - pw + 1.4 * UPI)} ${n(pTop)} L ${n(CX + pw - 1.4 * UPI)} ${n(pTop)} L ${n(CX + pw)} ${n(pTop + 2.2 * UPI)} L ${n(CX + pw)} ${n(hemY - 2.2 * UPI)} L ${n(CX - pw)} ${n(hemY - 2.2 * UPI)} Z`,
        fill: 'none' })
    }
    if (d.includes('pocketChest')) {
      const pw = 2.4 * UPI
      const px = CX + chestHalf * 0.36
      front.push({ type: 'rect', key: 'pocket', x: n(px - pw / 2), y: n(sy + 4.2 * UPI), w: n(pw), h: n(2.8 * UPI), fill: 'none' })
    }
    if (d.includes('raglan')) {
      front.push({ type: 'line', key: 'ragL', x1: n(CX - nh), y1: n(sy + 1), x2: n(CX - chestHalf), y2: n(armpitY), dash: '4 3' })
      front.push({ type: 'line', key: 'ragR', x1: n(CX + nh), y1: n(sy + 1), x2: n(CX + chestHalf), y2: n(armpitY), dash: '4 3' })
    }
  }

  if (view === 'back' && garment.group === 'shirts') {
    front.push({ type: 'line', key: 'yoke', x1: n(CX - chestHalf), y1: n(sy + 4 * UPI), x2: n(CX + chestHalf), y2: n(sy + 4 * UPI), dash: '4 3' })
  }

  // Ribbing / cuffs
  const sleeve = SLEEVE[sil.sleeve]
  const cc = sleeveCorners(sleeve, shoulderHalf, chestHalf)
  if (cc && (d.includes('ribCuff') || d.includes('ringer'))) {
    const t = 0.14
    const lerp = (a, b) => a + (b - a) * t
    for (const sgn of [-1, 1]) {
      front.push({ type: 'path', key: `cuff${sgn}`, d:
        `M ${n(CX + sgn * cc.outX)} ${n(cc.outY)} L ${n(CX + sgn * cc.inX)} ${n(cc.inY)} ` +
        `L ${n(CX + sgn * lerp(cc.inX, chestHalf))} ${n(lerp(cc.inY, armpitY))} ` +
        `L ${n(CX + sgn * lerp(cc.outX, shoulderHalf))} ${n(lerp(cc.outY, SHOULDER_Y))} Z`,
        fill: 'none' })
    }
  }
  if (d.includes('ribCuff') && ['crew_sweat', 'hoodie', 'zip_hoodie', 'quarter_zip_sweat', 'bomber'].includes(garment.id)) {
    front.push({ type: 'rect', key: 'hemRib', x: n(CX - m.hemHalf), y: n(hemY - 2.2 * UPI), w: n(m.hemHalf * 2), h: n(2.2 * UPI), fill: 'none' })
  }
  if (d.includes('ringer')) {
    front.push({ type: 'path', key: 'neckRib', d:
      `M ${n(CX - nh)} ${n(sy)} Q ${n(CX)} ${n(sy + neck.drop * 2 * UPI)} ${n(CX + nh)} ${n(sy)}`, fill: 'none', width: 3 })
  }

  return { behind, front }
}

// Where a print area sits on the garment, in SVG units, at true scale.
export function placementRect(garment, size, placementId, placementDef, areaDef) {
  const m = garmentMetrics(garment, size)
  const w = areaDef.w * UPI
  const h = areaDef.h * UPI
  const top = (areaDef.top ?? placementDef.top) * UPI
  const y = SHOULDER_Y + top

  let cx = CX
  // "Left chest" means the WEARER's left, which appears on the viewer's right
  // in a front view. Offset accordingly so mockups match the print file.
  if (placementDef.align === 'left') cx = CX + m.chestHalf * 0.44
  if (placementDef.align === 'right') cx = CX - m.chestHalf * 0.44

  return { x: cx - w / 2, y, w, h, cx, cy: y + h / 2 }
}

// The sleeve laid flat, as a print shop would hoop or platen it.
export function sleevePanel(garment, size) {
  const m = garmentMetrics(garment, size)
  const sil = garment.silhouette
  const sleeve = SLEEVE[sil.sleeve]
  if (!sleeve) return null

  // Cap width tracks the armhole depth; length is the sleeve's own reach.
  const capHalf = (m.armpitY - SHOULDER_Y) * 0.62
  const len = sleeve.innerDown * UPI * 0.9
  const cuffHalf = capHalf * (sil.sleeve === 'long' ? 0.55 : 0.82)
  const y0 = 40

  return {
    d: `M ${n(CX - capHalf)} ${n(y0)} ` +
       `Q ${n(CX)} ${n(y0 - 9)} ${n(CX + capHalf)} ${n(y0)} ` +
       `L ${n(CX + cuffHalf)} ${n(y0 + len)} L ${n(CX - cuffHalf)} ${n(y0 + len)} Z`,
    y0, len, capHalf, cuffHalf
  }
}
