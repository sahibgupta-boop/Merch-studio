// Print methods and what each one can physically reproduce. These constrain the
// design the same way garment type constrains placements: a method's colour ceiling
// and minimum stroke are not style advice, they are what the process can hold.

export const PRINT_METHODS = [
  {
    id: 'dtg',
    label: 'DTG (direct to garment)',
    maxColours: null,            // null = unlimited
    gradients: true,
    halftones: true,
    minStrokeIn: 0.02,
    maxComplexity: 5,
    requiresLightGarment: false,
    bestFor: 'Photographic and highly detailed art, one-off and low-volume orders.',
    watchOut: 'Colours sit duller on dark garments because of the underbase white.'
  },
  {
    id: 'screen',
    label: 'Screen print',
    maxColours: 6,
    gradients: false,            // simulate with halftones instead
    halftones: true,
    minStrokeIn: 0.03,
    maxComplexity: 4,
    requiresLightGarment: false,
    bestFor: 'Bold flat-colour art at volume — the cheapest per unit above ~50 pieces.',
    watchOut: 'Every colour is a separate screen, so each one adds setup cost. Gradients must be halftoned.'
  },
  {
    id: 'dtf',
    label: 'DTF (direct to film)',
    maxColours: null,
    gradients: true,
    halftones: true,
    minStrokeIn: 0.025,
    maxComplexity: 5,
    requiresLightGarment: false,
    bestFor: 'Full-colour art on any garment colour or fabric blend, small runs.',
    watchOut: 'The transfer film leaves a slight sheen; very fine isolated detail can lift after washing.'
  },
  {
    id: 'vinyl',
    label: 'Heat transfer vinyl',
    maxColours: 3,
    gradients: false,
    halftones: false,
    minStrokeIn: 0.08,
    maxComplexity: 2,
    requiresLightGarment: false,
    bestFor: 'Names, numbers and simple bold lettering. Very durable.',
    watchOut: 'Each colour is a separate cut layer weeded and pressed by hand — detail has to stay chunky.'
  },
  {
    id: 'sublimation',
    label: 'Dye sublimation',
    maxColours: null,
    gradients: true,
    halftones: true,
    minStrokeIn: 0.015,
    maxComplexity: 5,
    requiresLightGarment: true,
    bestFor: 'All-over and edge-to-edge prints with no hand feel at all.',
    watchOut: 'Only works on white or very light polyester. The ink dyes the fibre, so it cannot print white or lighten a dark garment.'
  }
]

export const METHODS_BY_ID = Object.fromEntries(PRINT_METHODS.map((m) => [m.id, m]))

export const colourCeiling = (method) => (method.maxColours ?? Infinity)
