import JSZip from 'jszip'
import { fontStyleFor } from './fonts.js'

// Inject the inlined @font-face immediately after the opening <svg> tag.
export function withFonts(svg, fontStyle) {
  if (!fontStyle) return svg
  return svg.replace(/(<svg[^>]*>)/, `$1${fontStyle}`)
}

export const svgDataUri = (svg) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)

// Rasterise at exactly the placement's physical size × 300 DPI. The canvas stays
// transparent — never fill it — because a print separation with a white background
// prints a white box on the garment.
export function svgToPngBlob(svg, pxWidth, pxHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = pxWidth
      canvas.height = pxHeight
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, pxWidth, pxHeight)
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas produced no blob'))), 'image/png')
    }
    img.onerror = () => reject(new Error('Could not rasterise the artwork SVG'))
    img.src = svgDataUri(svg)
  })
}

// A downscaled copy for conditioning the model shot. A full 3600x4800 separation
// base64-encodes to several megabytes and would exceed the function's body limit,
// and the model needs nothing like that resolution to reproduce the artwork.
export async function svgToPngBase64(svg, pxWidth, pxHeight, maxPx = 1024) {
  const scale = Math.min(1, maxPx / Math.max(pxWidth, pxHeight))
  const blob = await svgToPngBlob(svg, Math.round(pxWidth * scale), Math.round(pxHeight * scale))
  const buf = await blob.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

export function assetName(brief, art, ext) {
  return [
    slug(brief.concept.theme) || 'design',
    slug(brief.production.garment.label),
    art.placement.id,
    `${art.widthIn}x${art.heightIn}in`,
    '300dpi'
  ].join('_') + '.' + ext
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// The full pack: print separations, their source SVGs, the tech pack, and the
// brief — everything a print shop or a marketplace listing needs, in one archive.
export async function buildPack(brief, artworks, { mockups = [], techPack, prompt } = {}) {
  const zip = new JSZip()
  const fontStyle = await fontStyleFor(brief.typography?.fontPairing)

  const sep = zip.folder('print-separations')
  const src = zip.folder('source-svg')

  for (const art of artworks) {
    const svg = withFonts(art.svg, fontStyle)
    const png = await svgToPngBlob(svg, art.pxWidth, art.pxHeight)
    sep.file(assetName(brief, art, 'png'), png)
    src.file(assetName(brief, art, 'svg'), svg)
  }

  if (mockups.length) {
    const mk = zip.folder('mockups')
    for (const m of mockups) mk.file(m.name, m.blob)
  }

  zip.file('tech-pack.json', JSON.stringify(techPack ?? brief, null, 2))
  if (prompt) zip.file('design-brief.txt', prompt)
  zip.file('README.txt', packReadme(brief, artworks))

  return zip.generateAsync({ type: 'blob' })
}

function packReadme(brief, artworks) {
  const lines = [
    `${brief.concept.theme}`,
    `${brief.production.garment.label} · ${brief.colour.garment.label} · seed ${brief.seed}`,
    '',
    'print-separations/  transparent PNG, 300 DPI, sized to the exact print area',
    'source-svg/         vector source with the typeface embedded',
    'mockups/            product visualisations, not for print',
    'tech-pack.json      every parameter used, so this design is reproducible',
    '',
    'Placements:'
  ]
  for (const a of artworks) {
    lines.push(`  ${a.placement.label}: ${a.widthIn}in x ${a.heightIn}in  (${a.pxWidth} x ${a.pxHeight} px)`)
  }
  lines.push('', `Print method: ${brief.production.method}`,
    `Inks (${brief.colour.inks.length}): ${brief.colour.inks.join(', ')}`,
    `Minimum stroke: ${brief.production.minStrokeIn}in`,
    '', 'Separations have transparent backgrounds. Do not flatten onto white.')
  return lines.join('\n')
}
