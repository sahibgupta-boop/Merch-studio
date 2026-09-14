// Reference size charts, in inches. Chest is full circumference; length is HPS to hem.
// These are industry-typical blank dimensions — confirm against your actual supplier's
// spec sheet before committing a print run. Each garment references a chart family.

export const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']

export const REFERENCE_SIZE = 'L' // print separations are authored at this size

const chart = (chest, length, shoulder, sleeve) =>
  Object.fromEntries(SIZES.map((s, i) => [s, {
    chest: chest[i], length: length[i], shoulder: shoulder[i], sleeve: sleeve[i]
  }]))

export const SIZE_CHARTS = {
  tee: {
    label: 'Standard tee',
    rows: chart(
      [36, 40, 44, 48, 52, 56, 60, 64],
      [28, 29, 30, 31, 32, 33, 34, 35],
      [17, 18, 19.5, 21, 22.5, 24, 25, 26],
      [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5]
    )
  },
  teeLong: {
    label: 'Long-sleeve tee',
    rows: chart(
      [36, 40, 44, 48, 52, 56, 60, 64],
      [28, 29, 30, 31, 32, 33, 34, 35],
      [17, 18, 19.5, 21, 22.5, 24, 25, 26],
      [33, 33.5, 34, 34.5, 35, 35.5, 36, 36.5]
    )
  },
  oversized: {
    label: 'Oversized / drop shoulder',
    rows: chart(
      [42, 46, 50, 54, 58, 62, 66, 70],
      [28.5, 29.5, 30.5, 31.5, 32.5, 33.5, 34.5, 35.5],
      [21, 22.5, 24, 25.5, 27, 28.5, 30, 31.5],
      [8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12]
    )
  },
  tank: {
    label: 'Tank / muscle',
    rows: chart(
      [34, 38, 42, 46, 50, 54, 58, 62],
      [27.5, 28.5, 29.5, 30.5, 31.5, 32.5, 33.5, 34.5],
      [12, 13, 14, 15, 16, 17, 18, 19],
      [0, 0, 0, 0, 0, 0, 0, 0]
    )
  },
  polo: {
    label: 'Polo',
    rows: chart(
      [37, 41, 45, 49, 53, 57, 61, 65],
      [28.5, 29.5, 30.5, 31.5, 32.5, 33.5, 34.5, 35.5],
      [17.5, 18.5, 20, 21.5, 23, 24.5, 25.5, 26.5],
      [8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12]
    )
  },
  poloLong: {
    label: 'Long-sleeve polo / rugby',
    rows: chart(
      [38, 42, 46, 50, 54, 58, 62, 66],
      [29, 30, 31, 32, 33, 34, 35, 36],
      [17.5, 18.5, 20, 21.5, 23, 24.5, 25.5, 26.5],
      [33.5, 34, 34.5, 35, 35.5, 36, 36.5, 37]
    )
  },
  shirt: {
    label: 'Woven shirt',
    rows: chart(
      [38, 42, 46, 50, 54, 58, 62, 66],
      [29.5, 30.5, 31.5, 32.5, 33.5, 34.5, 35.5, 36.5],
      [17.5, 18.5, 20, 21.5, 23, 24.5, 25.5, 26.5],
      [33, 33.5, 34, 34.5, 35, 35.5, 36, 36.5]
    )
  },
  sweat: {
    label: 'Sweatshirt / hoodie',
    rows: chart(
      [40, 44, 48, 52, 56, 60, 64, 68],
      [27, 28, 29, 30, 31, 32, 33, 34],
      [19, 20.5, 22, 23.5, 25, 26.5, 28, 29.5],
      [33.5, 34, 34.5, 35, 35.5, 36, 36.5, 37]
    )
  },
  jacket: {
    label: 'Jacket',
    rows: chart(
      [41, 45, 49, 53, 57, 61, 65, 69],
      [26.5, 27.5, 28.5, 29.5, 30.5, 31.5, 32.5, 33.5],
      [19, 20.5, 22, 23.5, 25, 26.5, 28, 29.5],
      [33.5, 34, 34.5, 35, 35.5, 36, 36.5, 37]
    )
  }
}

// Size bands used when per-size scaling is enabled — POD suppliers expect one
// separation set per band rather than per individual size.
export const SIZE_BANDS = [
  { id: 'sm', label: 'S–M', sizes: ['S', 'M'], scale: 0.85 },
  { id: 'lxl', label: 'L–XL', sizes: ['L', 'XL'], scale: 1 },
  { id: 'xxl', label: '2XL+', sizes: ['2XL', '3XL', '4XL', '5XL'], scale: 1.12 }
]

export const bandForSize = (size) =>
  SIZE_BANDS.find((b) => b.sizes.includes(size)) || SIZE_BANDS[1]
