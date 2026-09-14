// The controlled vocabularies behind the style form. Enumerated rather than free
// text so a brief is reproducible and a batch stays visually coherent.

export const STYLES = [
  { id: 'vector_flat', label: 'Vector flat', hint: 'Clean shapes, no texture' },
  { id: 'line_art', label: 'Line art', hint: 'Single-weight contour drawing' },
  { id: 'retro_70s', label: 'Retro 70s', hint: 'Warm earth tones, arced type' },
  { id: 'y2k', label: 'Y2K chrome', hint: 'Liquid metal, bubble forms' },
  { id: 'graffiti', label: 'Streetwear graffiti', hint: 'Spray texture, wildstyle' },
  { id: 'vintage_distressed', label: 'Vintage distressed', hint: 'Cracked, faded overlay' },
  { id: 'minimal_type', label: 'Minimal typographic', hint: 'Type alone does the work' },
  { id: 'bauhaus', label: 'Swiss / Bauhaus', hint: 'Grid, primary shapes' },
  { id: 'anime', label: 'Anime', hint: 'Cel shading, expressive faces' },
  { id: 'mascot', label: 'Mascot / varsity', hint: 'Team crest energy' },
  { id: 'blackwork', label: 'Blackwork tattoo', hint: 'Heavy black, stippled shade' },
  { id: 'psychedelic', label: 'Psychedelic', hint: 'Warped type, saturated swirls' },
  { id: 'halftone_comic', label: 'Halftone comic', hint: 'Ben-Day dots, panel framing' },
  { id: 'ukiyo', label: 'Ukiyo-e', hint: 'Woodblock line and wave' },
  { id: 'cyberpunk', label: 'Cyberpunk', hint: 'Neon on black, glitch' },
  { id: 'collegiate', label: 'Collegiate', hint: 'Block letters, tackle twill' },
  { id: 'western', label: 'Western', hint: 'Slab serif, rope and ornament' },
  { id: 'grunge_photocopy', label: 'Grunge photocopy', hint: 'High-contrast xerox' }
]

export const FEELS = [
  { id: 'bold', label: 'Bold' },
  { id: 'calm', label: 'Calm' },
  { id: 'aggressive', label: 'Aggressive' },
  { id: 'playful', label: 'Playful' },
  { id: 'luxurious', label: 'Luxurious' },
  { id: 'nostalgic', label: 'Nostalgic' },
  { id: 'ironic', label: 'Ironic' },
  { id: 'wholesome', label: 'Wholesome' },
  { id: 'edgy', label: 'Edgy' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'deadpan', label: 'Deadpan' },
  { id: 'defiant', label: 'Defiant' }
]

export const ERAS = [
  { id: 'none', label: 'No era cue' },
  { id: '50s', label: '1950s' }, { id: '60s', label: '1960s' },
  { id: '70s', label: '1970s' }, { id: '80s', label: '1980s' },
  { id: '90s', label: '1990s' }, { id: 'y2k', label: '2000s' },
  { id: 'contemporary', label: 'Contemporary' }
]

export const OCCASIONS = [
  { id: 'everyday', label: 'Everyday' }, { id: 'event', label: 'Event' },
  { id: 'festival', label: 'Festival' }, { id: 'gift', label: 'Gift' },
  { id: 'team', label: 'Team / crew' }, { id: 'seasonal', label: 'Seasonal' },
  { id: 'gym', label: 'Gym / sport' }, { id: 'workwear', label: 'Workwear' }
]

export const TEXT_TREATMENTS = [
  { id: 'none', label: 'No text' },
  { id: 'stacked', label: 'Stacked' },
  { id: 'arched', label: 'Arched' },
  { id: 'slab', label: 'Slab banner' },
  { id: 'script', label: 'Script' },
  { id: 'outline', label: 'Outline only' },
  { id: 'warped', label: 'Warped' },
  { id: 'circular', label: 'Circular badge' }
]

// Open-licence (OFL) families only — safe to embed, outline and sell on merch.
export const FONT_PAIRINGS = [
  { id: 'anton_inter', label: 'Anton / Inter', display: 'Anton', body: 'Inter', mood: 'Loud, modern' },
  { id: 'bebas_barlow', label: 'Bebas Neue / Barlow', display: 'Bebas Neue', body: 'Barlow', mood: 'Athletic' },
  { id: 'archivo_archivo', label: 'Archivo Black / Archivo', display: 'Archivo Black', body: 'Archivo', mood: 'Editorial weight' },
  { id: 'playfair_lato', label: 'Playfair Display / Lato', display: 'Playfair Display', body: 'Lato', mood: 'Elevated, classic' },
  { id: 'space_space', label: 'Space Grotesk / Space Mono', display: 'Space Grotesk', body: 'Space Mono', mood: 'Technical' },
  { id: 'oswald_roboto', label: 'Oswald / Roboto', display: 'Oswald', body: 'Roboto', mood: 'Condensed, utilitarian' },
  { id: 'righteous_nunito', label: 'Righteous / Nunito', display: 'Righteous', body: 'Nunito', mood: 'Retro friendly' },
  { id: 'rubikmono_rubik', label: 'Rubik Mono One / Rubik', display: 'Rubik Mono One', body: 'Rubik', mood: 'Blocky, graphic' }
]

export const LAYOUT_ARCHETYPES = [
  { id: 'auto', label: 'Let the brief decide' },
  { id: 'centred_stack', label: 'Centred stack' },
  { id: 'arched_over_motif', label: 'Arched headline over motif' },
  { id: 'badge', label: 'Badge / circle emblem' },
  { id: 'poster', label: 'Full-bleed poster' },
  { id: 'lockup', label: 'Left-chest lockup' },
  { id: 'yoke_strip', label: 'Back yoke strip' },
  { id: 'sleeve_strip', label: 'Vertical sleeve strip' }
]

// Starter ink palettes. Each is capped small enough to survive screen printing.
export const PALETTE_PRESETS = [
  { id: 'mono_white', label: 'Mono white', inks: ['#f5f2ec'] },
  { id: 'mono_black', label: 'Mono black', inks: ['#14161a'] },
  { id: 'sunbaked', label: 'Sunbaked', inks: ['#e9b44c', '#d1603d', '#3d2b1f'] },
  { id: 'faded_denim', label: 'Faded denim', inks: ['#e8e4d9', '#7d99b4', '#2f4257'] },
  { id: 'acid', label: 'Acid', inks: ['#d8f24e', '#12100e', '#ff5964'] },
  { id: 'sage_clay', label: 'Sage & clay', inks: ['#cbd5c0', '#a4926f', '#4a4238'] },
  { id: 'neon_night', label: 'Neon night', inks: ['#ff2e88', '#00e5ff', '#0b0b14'] },
  { id: 'varsity', label: 'Varsity', inks: ['#f2efe6', '#b3242c', '#1f2a44'] },
  { id: 'sepia', label: 'Sepia press', inks: ['#e4d5b7', '#8c6a4a', '#33241a'] }
]
