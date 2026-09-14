import { FONT_PAIRINGS } from '../data/vocabularies.js'

// An SVG rasterised through Image() renders in an isolated context that cannot see
// the page's webfonts, so exported artwork would silently fall back to a default
// face — the text would print in the wrong typeface. Fixing that means inlining the
// actual font bytes into the SVG as a base64 @font-face before rasterising.

const cache = new Map()

const GOOGLE_CSS = (family, weights = '400;700') =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@${weights}&display=swap`

async function toBase64(buf) {
  let binary = ''
  const bytes = new Uint8Array(buf)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

// Returns a <style> block declaring the family with its bytes embedded, or '' if
// the font could not be fetched — in which case export still succeeds with a
// fallback face rather than failing outright.
async function inlineFamily(family) {
  if (cache.has(family)) return cache.get(family)
  const work = (async () => {
    try {
      const cssRes = await fetch(GOOGLE_CSS(family))
      if (!cssRes.ok) return ''
      const css = await cssRes.text()
      const urls = [...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1])
      if (!urls.length) return ''
      // One representative face is enough; the composer only uses a single weight.
      const fontRes = await fetch(urls[0])
      if (!fontRes.ok) return ''
      const b64 = await toBase64(await fontRes.arrayBuffer())
      return `@font-face{font-family:'${family}';font-style:normal;font-weight:400 900;` +
             `src:url(data:font/woff2;charset=utf-8;base64,${b64}) format('woff2');}`
    } catch {
      return ''
    }
  })()
  cache.set(family, work)
  return work
}

export async function fontStyleFor(pairingId) {
  const pairing = FONT_PAIRINGS.find((f) => f.id === pairingId) || FONT_PAIRINGS[0]
  const families = [...new Set([pairing.display, pairing.body])]
  const faces = await Promise.all(families.map(inlineFamily))
  const joined = faces.filter(Boolean).join('')
  return joined ? `<style>${joined}</style>` : ''
}

// Ask the browser to load the families for on-screen preview too.
export function preloadPairing(pairingId) {
  const pairing = FONT_PAIRINGS.find((f) => f.id === pairingId) || FONT_PAIRINGS[0]
  for (const family of [pairing.display, pairing.body]) {
    const id = `gf-${family.replace(/\s+/g, '-')}`
    if (document.getElementById(id)) continue
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = GOOGLE_CSS(family)
    document.head.appendChild(link)
  }
}

export const allFamilies = () =>
  [...new Set(FONT_PAIRINGS.flatMap((f) => [f.display, f.body]))]
