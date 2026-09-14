// Placement definitions. `top` is inches measured down from HPS (high point shoulder).
// Sizes are maximums in inches at the reference size; a garment may shrink them.

export const PLACEMENTS = {
  front_full:   { id: 'front_full',   label: 'Front — full',      view: 'front',  align: 'center', top: 3 },
  front_centre: { id: 'front_centre', label: 'Front — centre chest', view: 'front', align: 'center', top: 3 },
  left_chest:   { id: 'left_chest',   label: 'Left chest',        view: 'front',  align: 'left',   top: 3.5 },
  right_chest:  { id: 'right_chest',  label: 'Right chest',       view: 'front',  align: 'right',  top: 3.5 },
  back_full:    { id: 'back_full',    label: 'Back — full',       view: 'back',   align: 'center', top: 3 },
  back_yoke:    { id: 'back_yoke',    label: 'Back yoke',         view: 'back',   align: 'center', top: 1.5 },
  neck_label:   { id: 'neck_label',   label: 'Inner neck label',  view: 'back',   align: 'center', top: 0.5 },
  sleeve_left:  { id: 'sleeve_left',  label: 'Left sleeve',       view: 'sleeve', align: 'center', top: 0 },
  sleeve_right: { id: 'sleeve_right', label: 'Right sleeve',      view: 'sleeve', align: 'center', top: 0 }
}

export const PLACEMENT_ORDER = [
  'front_full', 'front_centre', 'left_chest', 'right_chest',
  'back_full', 'back_yoke', 'neck_label', 'sleeve_left', 'sleeve_right'
]

// Helper for garment definitions: an available print area.
export const area = (w, h, extra = {}) => ({ enabled: true, w, h, ...extra })

// Helper: a placement this garment physically cannot take, with the reason shown
// on hover in the UI. Never hide these silently — the seller needs to know why.
export const blocked = (reason) => ({ enabled: false, reason })
