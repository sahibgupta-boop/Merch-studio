import { area, blocked } from './placements.js'

// Every garment carries its OWN print-area map. This is the whole point: a zipper
// polo cannot take a full front print because the zip splits the panel, and a
// pullover hoodie's lower front is blocked by the kangaroo pocket. Selecting a
// garment rewrites which placements exist and how big they can be.
//
// silhouette traits drive the parametric SVG preview in components/GarmentSilhouette.jsx
//   fit:      slim | regular | boxy | oversized | tank
//   neckline: crew | v | scoop | henley | polo | mandarin | shirt | camp | hood | zipHood | quarterZip
//   sleeve:   short | long | threequarter | none
//   details:  placket | buttons | zipFull | zipQuarter | pocketKangaroo | pocketChest |
//             ribCuff | ringer | raglan | cuffPlacket

const g = (id, label, group, chart, silhouette, print) => ({
  id, label, group, chart, silhouette, print
})

export const GARMENT_GROUPS = [
  { id: 'tees', label: 'T-shirts' },
  { id: 'polos', label: 'Polos' },
  { id: 'shirts', label: 'Shirts' },
  { id: 'sweats', label: 'Sweats & outerwear' }
]

export const GARMENTS = [
  // ---------------------------------------------------------------- T-shirts
  g('crew_tee', 'Crew neck tee', 'tees', 'tee',
    { fit: 'regular', neckline: 'crew', sleeve: 'short', details: [] },
    {
      front_full: area(12, 16), front_centre: area(12, 6),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 16), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: area(3.5, 3.5), sleeve_right: area(3.5, 3.5)
    }),

  g('v_neck_tee', 'V-neck tee', 'tees', 'tee',
    { fit: 'regular', neckline: 'v', sleeve: 'short', details: [] },
    {
      front_full: area(12, 15, { top: 4 }), front_centre: area(12, 5, { top: 4.5 }),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 16), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: area(3.5, 3.5), sleeve_right: area(3.5, 3.5)
    }),

  g('henley', 'Henley', 'tees', 'tee',
    { fit: 'regular', neckline: 'henley', sleeve: 'short', details: ['placket', 'buttons'] },
    {
      front_full: blocked('Button placket runs through the centre front'),
      front_centre: blocked('Button placket runs through the centre front'),
      left_chest: area(3.5, 3.5), right_chest: area(3.5, 3.5),
      back_full: area(12, 16), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: area(3.5, 3.5), sleeve_right: area(3.5, 3.5)
    }),

  g('oversized_tee', 'Oversized / drop shoulder tee', 'tees', 'oversized',
    { fit: 'oversized', neckline: 'crew', sleeve: 'short', details: [] },
    {
      front_full: area(14, 18, { top: 4 }), front_centre: area(14, 7, { top: 4 }),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(14, 18, { top: 4 }), back_yoke: area(14, 3.5), neck_label: area(2, 2),
      sleeve_left: area(4, 4), sleeve_right: area(4, 4)
    }),

  g('boxy_tee', 'Boxy relaxed tee', 'tees', 'oversized',
    { fit: 'boxy', neckline: 'crew', sleeve: 'short', details: [] },
    {
      front_full: area(13, 15), front_centre: area(13, 6),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(13, 15), back_yoke: area(13, 3), neck_label: area(2, 2),
      sleeve_left: area(3.5, 3.5), sleeve_right: area(3.5, 3.5)
    }),

  g('long_sleeve_tee', 'Long-sleeve tee', 'tees', 'teeLong',
    { fit: 'regular', neckline: 'crew', sleeve: 'long', details: ['ribCuff'] },
    {
      front_full: area(12, 16), front_centre: area(12, 6),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 16), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: area(3.5, 12), sleeve_right: area(3.5, 12)
    }),

  g('raglan_tee', 'Raglan / baseball tee', 'tees', 'teeLong',
    { fit: 'regular', neckline: 'crew', sleeve: 'threequarter', details: ['raglan'] },
    {
      front_full: area(12, 16), front_centre: area(12, 6),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 16), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: blocked('Raglan seam runs diagonally across the sleeve'),
      sleeve_right: blocked('Raglan seam runs diagonally across the sleeve')
    }),

  g('ringer_tee', 'Ringer tee', 'tees', 'tee',
    { fit: 'regular', neckline: 'crew', sleeve: 'short', details: ['ringer'] },
    {
      front_full: area(12, 15), front_centre: area(12, 6),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 15), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: blocked('Contrast ringer cuff leaves no flat print area'),
      sleeve_right: blocked('Contrast ringer cuff leaves no flat print area')
    }),

  g('pocket_tee', 'Pocket tee', 'tees', 'tee',
    { fit: 'regular', neckline: 'crew', sleeve: 'short', details: ['pocketChest'] },
    {
      front_full: blocked('Chest pocket sits inside the front print area'),
      front_centre: area(12, 5, { top: 9 }),
      left_chest: blocked('Chest pocket occupies the left chest'),
      right_chest: area(4, 4),
      back_full: area(12, 16), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: area(3.5, 3.5), sleeve_right: area(3.5, 3.5)
    }),

  g('tank', 'Tank / muscle tee', 'tees', 'tank',
    { fit: 'tank', neckline: 'scoop', sleeve: 'none', details: [] },
    {
      front_full: area(9, 14), front_centre: area(9, 5),
      left_chest: area(3.5, 3.5), right_chest: area(3.5, 3.5),
      back_full: area(9, 14), back_yoke: area(9, 3), neck_label: area(2, 2),
      sleeve_left: blocked('Sleeveless'), sleeve_right: blocked('Sleeveless')
    }),

  // ------------------------------------------------------------------- Polos
  g('polo', 'Classic piqué polo', 'polos', 'polo',
    { fit: 'regular', neckline: 'polo', sleeve: 'short', details: ['placket', 'buttons'] },
    {
      front_full: blocked('Button placket runs through the centre front'),
      front_centre: blocked('Button placket runs through the centre front'),
      left_chest: area(3.5, 3.5), right_chest: area(3.5, 3.5),
      back_full: area(10, 12, { top: 4 }), back_yoke: area(10, 3), neck_label: area(2, 2),
      sleeve_left: area(3, 3), sleeve_right: area(3, 3)
    }),

  g('zipper_polo', 'Zipper polo (quarter-zip)', 'polos', 'polo',
    { fit: 'regular', neckline: 'quarterZip', sleeve: 'short', details: ['zipQuarter'] },
    {
      front_full: blocked('Zip splits the front panel in two'),
      front_centre: blocked('Zip splits the front panel in two'),
      left_chest: area(3.5, 3.5), right_chest: area(3.5, 3.5),
      back_full: area(10, 12, { top: 4 }), back_yoke: area(10, 3), neck_label: area(2, 2),
      sleeve_left: area(3, 3), sleeve_right: area(3, 3)
    }),

  g('mandarin_polo', 'Band / mandarin collar polo', 'polos', 'polo',
    { fit: 'regular', neckline: 'mandarin', sleeve: 'short', details: ['placket', 'buttons'] },
    {
      front_full: blocked('Button placket runs through the centre front'),
      front_centre: blocked('Button placket runs through the centre front'),
      left_chest: area(3.5, 3.5), right_chest: area(3.5, 3.5),
      back_full: area(10, 12, { top: 4 }), back_yoke: area(10, 3), neck_label: area(2, 2),
      sleeve_left: area(3, 3), sleeve_right: area(3, 3)
    }),

  g('long_polo', 'Long-sleeve polo', 'polos', 'poloLong',
    { fit: 'regular', neckline: 'polo', sleeve: 'long', details: ['placket', 'buttons', 'cuffPlacket'] },
    {
      front_full: blocked('Button placket runs through the centre front'),
      front_centre: blocked('Button placket runs through the centre front'),
      left_chest: area(3.5, 3.5), right_chest: area(3.5, 3.5),
      back_full: area(10, 12, { top: 4 }), back_yoke: area(10, 3), neck_label: area(2, 2),
      sleeve_left: area(3, 10), sleeve_right: area(3, 10)
    }),

  g('rugby', 'Rugby shirt', 'polos', 'poloLong',
    { fit: 'regular', neckline: 'polo', sleeve: 'long', details: ['placket', 'buttons'] },
    {
      front_full: blocked('Button placket and contrast stripes break the front panel'),
      front_centre: blocked('Button placket runs through the centre front'),
      left_chest: area(3.5, 3.5), right_chest: area(3.5, 3.5),
      back_full: area(10, 10, { top: 5 }), back_yoke: area(10, 3), neck_label: area(2, 2),
      sleeve_left: area(3, 8), sleeve_right: area(3, 8)
    }),

  // ------------------------------------------------------------------ Shirts
  g('oxford', 'Oxford button-down', 'shirts', 'shirt',
    { fit: 'regular', neckline: 'shirt', sleeve: 'long', details: ['placket', 'buttons', 'pocketChest', 'cuffPlacket'] },
    {
      front_full: blocked('Full button placket runs through the centre front'),
      front_centre: blocked('Full button placket runs through the centre front'),
      left_chest: blocked('Chest pocket occupies the left chest'),
      right_chest: area(3.5, 3.5),
      back_full: area(11, 14, { top: 4 }), back_yoke: area(11, 3), neck_label: area(2, 2),
      sleeve_left: area(3, 8), sleeve_right: area(3, 8)
    }),

  g('camp_collar', 'Camp / Cuban collar shirt', 'shirts', 'shirt',
    { fit: 'boxy', neckline: 'camp', sleeve: 'short', details: ['placket', 'buttons'] },
    {
      front_full: blocked('Full button placket runs through the centre front'),
      front_centre: blocked('Full button placket runs through the centre front'),
      left_chest: area(3.5, 3.5), right_chest: area(3.5, 3.5),
      back_full: area(11, 13, { top: 4 }), back_yoke: area(11, 3), neck_label: area(2, 2),
      sleeve_left: area(3, 3), sleeve_right: area(3, 3)
    }),

  g('flannel', 'Flannel shirt', 'shirts', 'shirt',
    { fit: 'regular', neckline: 'shirt', sleeve: 'long', details: ['placket', 'buttons', 'pocketChest', 'cuffPlacket'] },
    {
      front_full: blocked('Full button placket runs through the centre front'),
      front_centre: blocked('Full button placket runs through the centre front'),
      left_chest: blocked('Chest pocket occupies the left chest'),
      right_chest: area(3.5, 3.5),
      back_full: area(11, 13, { top: 4, note: 'Plaid ground — use high-contrast art' }),
      back_yoke: area(11, 3), neck_label: area(2, 2),
      sleeve_left: area(3, 8), sleeve_right: area(3, 8)
    }),

  g('overshirt', 'Overshirt / shacket', 'shirts', 'jacket',
    { fit: 'boxy', neckline: 'shirt', sleeve: 'long', details: ['placket', 'buttons', 'pocketChest'] },
    {
      front_full: blocked('Full button placket runs through the centre front'),
      front_centre: blocked('Full button placket runs through the centre front'),
      left_chest: blocked('Chest pocket occupies the left chest'),
      right_chest: area(4, 4),
      back_full: area(12, 14, { top: 4 }), back_yoke: area(12, 3.5), neck_label: area(2, 2),
      sleeve_left: area(3.5, 8), sleeve_right: area(3.5, 8)
    }),

  // ------------------------------------------------------- Sweats & outerwear
  g('crew_sweat', 'Crewneck sweatshirt', 'sweats', 'sweat',
    { fit: 'regular', neckline: 'crew', sleeve: 'long', details: ['ribCuff'] },
    {
      front_full: area(12, 16), front_centre: area(12, 6),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 16), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: area(3.5, 12), sleeve_right: area(3.5, 12)
    }),

  g('hoodie', 'Pullover hoodie', 'sweats', 'sweat',
    { fit: 'regular', neckline: 'hood', sleeve: 'long', details: ['pocketKangaroo', 'ribCuff'] },
    {
      front_full: area(11, 9, { top: 5, note: 'Kangaroo pocket blocks the lower front — art must clear it' }),
      front_centre: area(11, 5, { top: 5 }),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 16), back_yoke: blocked('Hood covers the upper back'),
      neck_label: blocked('Hood seam replaces the inner neck label position'),
      sleeve_left: area(3.5, 12), sleeve_right: area(3.5, 12)
    }),

  g('zip_hoodie', 'Zip-up hoodie', 'sweats', 'sweat',
    { fit: 'regular', neckline: 'zipHood', sleeve: 'long', details: ['zipFull', 'pocketKangaroo', 'ribCuff'] },
    {
      front_full: blocked('Zip splits the front into two separate panels'),
      front_centre: blocked('Zip splits the front into two separate panels'),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 16), back_yoke: blocked('Hood covers the upper back'),
      neck_label: blocked('Hood seam replaces the inner neck label position'),
      sleeve_left: area(3.5, 12), sleeve_right: area(3.5, 12)
    }),

  g('quarter_zip_sweat', 'Quarter-zip sweatshirt', 'sweats', 'sweat',
    { fit: 'regular', neckline: 'quarterZip', sleeve: 'long', details: ['zipQuarter', 'ribCuff'] },
    {
      front_full: blocked('Quarter zip runs through the upper centre front'),
      front_centre: blocked('Quarter zip runs through the upper centre front'),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 16), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: area(3.5, 12), sleeve_right: area(3.5, 12)
    }),

  g('coach_jacket', 'Coach jacket', 'sweats', 'jacket',
    { fit: 'boxy', neckline: 'mandarin', sleeve: 'long', details: ['buttons', 'placket'] },
    {
      front_full: blocked('Snap placket runs through the centre front'),
      front_centre: blocked('Snap placket runs through the centre front'),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 14, { top: 4 }), back_yoke: area(12, 3.5), neck_label: area(2, 2),
      sleeve_left: area(3.5, 10), sleeve_right: area(3.5, 10)
    }),

  g('bomber', 'Bomber jacket', 'sweats', 'jacket',
    { fit: 'regular', neckline: 'mandarin', sleeve: 'long', details: ['zipFull', 'ribCuff'] },
    {
      front_full: blocked('Zip splits the front into two separate panels'),
      front_centre: blocked('Zip splits the front into two separate panels'),
      left_chest: area(4, 4), right_chest: area(4, 4),
      back_full: area(12, 13, { top: 4 }), back_yoke: area(12, 3), neck_label: area(2, 2),
      sleeve_left: area(3.5, 9), sleeve_right: area(3.5, 9)
    })
]

export const GARMENTS_BY_ID = Object.fromEntries(GARMENTS.map((x) => [x.id, x]))

export const garmentsInGroup = (groupId) => GARMENTS.filter((x) => x.group === groupId)

// Which placements are actually printable on this garment.
export const enabledPlacements = (garment) =>
  Object.entries(garment.print).filter(([, v]) => v.enabled).map(([k]) => k)
