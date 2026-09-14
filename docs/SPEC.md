# Merch Studio — Master Build Prompt

## 0. One-line brief
Build a web app for print-on-demand sellers that turns a structured form (garment
type, style, feel, niche, palette, print method, placements) into a complete,
production-ready apparel design pack: vector artwork composed as SVG, exported as
300 DPI transparent print separations per placement, plus garment mockups and a
tech pack. Gemini drives the creative brief; a deterministic SVG composer guarantees
the files are actually printable.

## 1. Core principle (the thing most AI tee generators get wrong)
An AI-generated JPEG is not a print file. Every output must satisfy:
- transparent background, no off-white halo
- exact physical dimensions at 300 DPI for the chosen placement
- colour count that respects the chosen print method
- no element thinner than the method's minimum stroke
- reproducible from a stored seed + parameter set

So: **Gemini decides *what* the design is. The SVG composer decides *how it is
built*.** Raster art from Gemini's image model is allowed only as a contained
motif layer, auto-background-removed, and never for text.

## 2. Garment types (male tops) — `garment` field
Grouped, because print geometry differs per group. Each entry carries its own
print-area map, not a shared one.

**T-shirts**
crew neck · v-neck · henley · oversized / drop-shoulder · boxy relaxed fit ·
long-sleeve · raglan (baseball) · ringer · pocket tee · tank / muscle tee

**Polos**
classic piqué polo · zipper polo (quarter-zip) · band/mandarin-collar polo ·
long-sleeve polo · rugby shirt

**Shirts**
oxford button-down · camp/Cuban collar · flannel · mandarin-collar shirt ·
overshirt / shacket

**Sweats & outerwear**
crewneck sweatshirt · pullover hoodie · zip-up hoodie · quarter-zip sweatshirt ·
coach jacket · bomber

### 2.1 Per-garment print-area map (required, not optional)
Selecting a garment must *change the available placements and their max sizes*:

| Garment | Front full | Centre chest | Left chest | Back full | Sleeve | Notes |
|---|---|---|---|---|---|---|
| Crew / v-neck tee | 12×16in | 12×6in | 4×4in | 12×16in | 3.5×3.5in | baseline |
| Oversized tee | 14×18in | 14×7in | 4×4in | 14×18in | 4×4in | wider body, print sits lower |
| Polo | ✗ | ✗ | 3.5×3.5in | 10×12in | 3×3in | placket blocks centre front |
| Zipper polo | ✗ | ✗ | 3.5×3.5in (right side only) | 10×12in | 3×3in | zip splits front |
| Button-down shirt | ✗ | ✗ | 3.5×3.5in | 11×14in | 3×3in | pocket may block chest |
| Pullover hoodie | split L/R of pocket | 11×5in above pocket | 4×4in | 12×16in | 3.5×12in | kangaroo pocket blocks lower front |
| Zip hoodie | ✗ | ✗ | 4×4in each panel | 12×16in | 3.5×12in | zipper splits front into two panels |
| Raglan tee | 12×16in | 12×6in | 4×4in | 12×16in | ✗ | raglan seam crosses sleeve |
| Tank | 9×14in | 9×5in | 3.5×3.5in | 9×14in | ✗ | narrow body |

Disabled placements must be visibly greyed with the reason on hover
("blocked by placket"), never silently hidden.

## 3. Size section with style preview (per user request)
When a garment type is selected, reveal a **Fit & Size** panel containing:
1. **Style preview** — a to-scale SVG silhouette of that exact garment, rendered in
   the selected garment colour, with the live print areas outlined as dashed boxes.
   Toggle front / back / left sleeve / right sleeve.
2. **Size selector** — S · M · L · XL · 2XL · 3XL · 4XL · 5XL.
3. **Size chart** — chest, body length, shoulder, sleeve length, in inches **and** cm,
   values specific to that garment type (an oversized tee's M ≠ a polo's M).
4. **Scale feedback** — the preview re-renders when size changes, showing how the
   same artwork reads on a S vs a 3XL, with the note that print files are produced
   at the reference size (L) unless per-size scaling is enabled.
5. **Per-size scaling toggle** — when on, export a separate separation set scaled
   per size band (S–M, L–XL, 2XL+), which is what real POD suppliers expect.

## 4. Input fields — the "columns"
All fields are persisted per design and exported into the tech pack.

**Concept**
- `theme` — free text subject ("desert road trip", "gym motivation")
- `niche` — POD niche/keyword ("fishing dad", "software engineer humour")
- `audience` — age band, gender lean, subculture
- `occasion` — everyday, event, festival, gift, team, seasonal

**Style**
- `style` (multi-select, weighted): vector flat · line art · retro 70s · Y2K chrome ·
  streetwear graffiti · vintage distressed · minimal typographic · Swiss/Bauhaus ·
  anime · mascot/varsity · blackwork tattoo · psychedelic · halftone comic ·
  ukiyo-e · cyberpunk · collegiate · western · grunge photocopy
- `feel` / mood (multi-select): bold · calm · aggressive · playful · luxurious ·
  nostalgic · ironic · wholesome · edgy · spiritual · deadpan
- `complexity` — 1–5 slider (drives element count and detail density)
- `era` — decade reference

**Typography**
- `headline` / `subline` / `microcopy` text fields
- `text_treatment` — none · arched · stacked · slab · script · outline · warped
- `font_pairing` — chosen from a licensed, bundled set (never a system font that
  won't exist on the printer's machine); all text outlined to paths on export

**Colour**
- `garment_colour` — from a real blank catalogue (black, white, heather grey, navy,
  sand, olive, maroon …), stored with hex
- `palette_mode` — auto from brief · locked brand palette · manual
- `max_colours` — 1–8, hard-enforced; defaults from print method
- automatic contrast check of artwork against garment colour, with a warning when
  a colour sits within ΔE threshold of the garment

**Production**
- `print_method` — DTG · screen print · DTF · vinyl · sublimation · embroidery
  (each sets max colours, min stroke width, gradient allowance, max detail)
- `placements` — multi-select, filtered by garment (§2.1)
- `bleed_safe_margin`, `seed`, `variation_count` (1–12 for batch generation)

**Brand kit (optional)**
- locked logo (SVG upload), locked fonts, locked palette, mandatory neck-label art

## 5. Generation pipeline
```
form state
  → validate against print-method + garment constraints
  → Gemini (text model) returns STRUCTURED JSON design brief:
      { concept, layout_archetype, palette[], copy{}, motifs[], composition_notes }
  → [optional] Gemini image model renders motif assets → background removal → traced/embedded
  → SVG composer assembles layers at exact print dimensions per placement
  → constraint pass: colour count, stroke width, transparency, safe margins
  → outputs
```
Gemini is called only from a **Netlify serverless function**; the API key lives in
Netlify env vars and never reaches the browser. Client gets a rate-limited,
key-less endpoint.

Layout archetypes the composer can build (Gemini picks one, doesn't invent geometry):
centred stack · arched headline over motif · badge/circle emblem · full-bleed poster ·
left-chest lockup · back yoke strip · vertical sleeve strip · split-panel (zip garments).

## 6. Outputs per design (all three you selected)
**A. Print-ready separations**
- transparent PNG, 300 DPI, exact placement dimensions
- source SVG alongside each PNG
- screen print: one file per spot colour + a composite, with a colour registration sheet
- filenames: `{design}_{garment}_{placement}_{w}x{h}in_300dpi.png`

**B. Mockup previews**
- garment silhouette composited with the artwork, in the selected garment colour
- front, back, left sleeve, right sleeve
- flat-lay and on-model variants; 2000×2000 square exports for marketplace listings

**C. Spec sheet / tech pack (PDF + JSON)**
- garment type, colour, size range, size chart
- per-placement: position measured from HPS (high point shoulder), width × height
- ink colour list with hex + nearest Pantone
- print method, max colours, min stroke width
- every input field and the seed, so the design is exactly reproducible

**D. Zip bundle** — all of the above per design, plus a `manifest.json`.

## 7. POD seller features
- **Collections** — group designs into a themed series with a shared palette and
  style lock, so a 20-listing drop looks coherent
- **Batch generate** — one brief → N variations in one run, gallery review, star keepers
- **Listing metadata** — Gemini drafts title, bullet points, description and tag set
  per design, sized to marketplace limits
- **Niche presets** — saved parameter sets, duplicable
- **Bulk export** — zip of every starred design across a collection
- **Reproducibility** — any past design reopens with its exact parameters and seed

## 8. Screens
1. **Studio** — the form, organised as Concept → Garment & Fit → Style → Colour →
   Production, with live style preview docked on the right
2. **Results gallery** — variation grid, star/reject, quick-regenerate a single placement
3. **Design detail** — layer list, per-placement tabs, mockup viewer, constraint warnings,
   export panel
4. **Collections** — series management and bulk export
5. **Library** — all designs, filter by garment, style, collection, date

## 9. Tech
Vite + React + Tailwind · SVG composition in-app · `resvg-wasm` or canvas for
300 DPI raster export · `jsPDF` for the tech pack · `JSZip` for bundles ·
Netlify Functions for the Gemini proxy · IndexedDB for local library, with a
pluggable remote store later. New standalone repo.

## 10. Acceptance criteria
- Selecting **zipper polo** removes full-front placements and shows the split-panel
  print map; selecting **pullover hoodie** shows the pocket-blocked lower front.
- Selecting any garment reveals the Fit & Size panel with a to-scale styled preview
  and a garment-specific size chart in inches and cm.
- A screen-print design with `max_colours: 3` cannot export a file containing a
  fourth colour — the constraint pass fails loudly rather than silently flattening.
- Every exported PNG opens at exactly the stated inch dimensions at 300 DPI with a
  genuinely transparent background.
- Re-running a stored seed + parameter set reproduces the same artwork.
- No Gemini API key is present in any client bundle.
