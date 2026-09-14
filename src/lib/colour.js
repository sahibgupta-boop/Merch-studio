// Colour maths for the constraint pass. Ink-vs-garment separation is judged in
// CIE Lab with ΔE2000 rather than by comparing hex values, because perceptual
// distance is what decides whether a print actually reads on the fabric.

export function hexToRgb(hex) {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const v = parseInt(full, 16)
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 }
}

export const isValidHex = (hex) => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(hex).trim())

export const normaliseHex = (hex) => {
  const h = String(hex).replace('#', '').trim().toLowerCase()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return '#' + full
}

const srgbToLinear = (c) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export function hexToLab(hex) {
  const { r, g, b } = hexToRgb(hex)
  const [R, G, B] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]
  // sRGB D65 matrix
  const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047
  const Y = (R * 0.2126729 + G * 0.7151522 + B * 0.0721750) / 1.0
  const Z = (R * 0.0193339 + G * 0.1191920 + B * 0.9503041) / 1.08883
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29)
  const [fx, fy, fz] = [f(X), f(Y), f(Z)]
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) }
}

// CIEDE2000. Standard implementation; kept verbose to stay checkable.
export function deltaE2000(hex1, hex2) {
  const l1 = hexToLab(hex1), l2 = hexToLab(hex2)
  const rad = Math.PI / 180, deg = 180 / Math.PI

  const C1 = Math.hypot(l1.a, l1.b), C2 = Math.hypot(l2.a, l2.b)
  const Cbar = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))))

  const a1p = (1 + G) * l1.a, a2p = (1 + G) * l2.a
  const C1p = Math.hypot(a1p, l1.b), C2p = Math.hypot(a2p, l2.b)

  const hp = (b, ap) => {
    if (b === 0 && ap === 0) return 0
    const h = Math.atan2(b, ap) * deg
    return h >= 0 ? h : h + 360
  }
  const h1p = hp(l1.b, a1p), h2p = hp(l2.b, a2p)

  const dLp = l2.L - l1.L
  const dCp = C2p - C1p

  let dhp = 0
  if (C1p * C2p !== 0) {
    const diff = h2p - h1p
    if (Math.abs(diff) <= 180) dhp = diff
    else if (diff > 180) dhp = diff - 360
    else dhp = diff + 360
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * rad) / 2)

  const Lbarp = (l1.L + l2.L) / 2
  const Cbarp = (C1p + C2p) / 2

  let hbarp
  if (C1p * C2p === 0) hbarp = h1p + h2p
  else if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2
  else if (h1p + h2p < 360) hbarp = (h1p + h2p + 360) / 2
  else hbarp = (h1p + h2p - 360) / 2

  const T = 1
    - 0.17 * Math.cos((hbarp - 30) * rad)
    + 0.24 * Math.cos(2 * hbarp * rad)
    + 0.32 * Math.cos((3 * hbarp + 6) * rad)
    - 0.20 * Math.cos((4 * hbarp - 63) * rad)

  const dTheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2))
  const Rc = 2 * Math.sqrt(Math.pow(Cbarp, 7) / (Math.pow(Cbarp, 7) + Math.pow(25, 7)))
  const Sl = 1 + (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2))
  const Sc = 1 + 0.045 * Cbarp
  const Sh = 1 + 0.015 * Cbarp * T
  const Rt = -Math.sin(2 * dTheta * rad) * Rc

  return Math.sqrt(
    Math.pow(dLp / Sl, 2) +
    Math.pow(dCp / Sc, 2) +
    Math.pow(dHp / Sh, 2) +
    Rt * (dCp / Sc) * (dHp / Sh)
  )
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

export function contrastRatio(hex1, hex2) {
  const a = relativeLuminance(hex1), b = relativeLuminance(hex2)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

// Below this an ink starts disappearing into the garment under shop lighting.
export const INK_SEPARATION_MIN = 22

export function inkSeparation(inkHex, garmentHex) {
  const dE = deltaE2000(inkHex, garmentHex)
  return {
    deltaE: dE,
    ok: dE >= INK_SEPARATION_MIN,
    severity: dE < 10 ? 'severe' : dE < INK_SEPARATION_MIN ? 'low' : 'ok'
  }
}
