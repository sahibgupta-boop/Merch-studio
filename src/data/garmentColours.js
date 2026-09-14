// Blank garment colours, with the hex used for preview and mockup tinting.
// `dark` tells the contrast checker which way artwork needs to read.
export const GARMENT_COLOURS = [
  { id: 'white',        label: 'White',        hex: '#f7f7f5', dark: false },
  { id: 'natural',      label: 'Natural',      hex: '#ece3d2', dark: false },
  { id: 'sand',         label: 'Sand',         hex: '#d8c7ab', dark: false },
  { id: 'ash',          label: 'Ash',          hex: '#d3d4d2', dark: false },
  { id: 'heather_grey', label: 'Heather grey', hex: '#9ea3a6', dark: false },
  { id: 'charcoal',     label: 'Charcoal',     hex: '#4a4d52', dark: true },
  { id: 'black',        label: 'Black',        hex: '#17181a', dark: true },
  { id: 'navy',         label: 'Navy',         hex: '#1f2a44', dark: true },
  { id: 'royal',        label: 'Royal blue',   hex: '#2a4bb0', dark: true },
  { id: 'olive',        label: 'Olive',        hex: '#5c5f3f', dark: true },
  { id: 'forest',       label: 'Forest',       hex: '#25402f', dark: true },
  { id: 'maroon',       label: 'Maroon',       hex: '#5c2230', dark: true },
  { id: 'red',          label: 'Red',          hex: '#b3242c', dark: true },
  { id: 'mustard',      label: 'Mustard',      hex: '#c8952b', dark: false },
  { id: 'dusty_pink',   label: 'Dusty pink',   hex: '#d5a8a4', dark: false }
]

export const COLOURS_BY_ID = Object.fromEntries(GARMENT_COLOURS.map((c) => [c.id, c]))
