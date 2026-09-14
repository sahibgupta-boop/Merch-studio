# Merch Studio

A print-on-demand apparel design generator. You enter garment type, style, feel,
niche, palette and print method; it produces production-ready design packs —
300 DPI transparent print separations per placement, garment mockups, and a tech
pack — rather than a picture of a t-shirt.

Full product spec: [`docs/SPEC.md`](docs/SPEC.md)

## The core idea

An AI-generated JPEG is not a print file. Every output has to satisfy a
transparent background, exact physical dimensions at 300 DPI, a colour count the
print method can actually reproduce, and a minimum stroke width. So the split is:

- **Gemini** decides *what* the design is — it returns a structured JSON design
  brief (concept, palette, layout archetype, copy) from your form inputs.
- **The SVG composer** decides *how it is built* — deterministic geometry at exact
  print dimensions, so the file a print shop receives is valid by construction.

The app works with no API key configured; the composer falls back to deterministic
template composition.

## Current state

Implemented:

- **25 garment types** across tees, polos, shirts and sweats/outerwear, each with
  its own print-area map — see `src/data/garments.js`
- **Per-garment placement rules.** A zipper polo has no full-front placement
  because the zip splits the panel; a pullover hoodie's lower front is blocked by
  the kangaroo pocket; an oxford's left chest is taken by the pocket. Blocked
  placements are shown struck through with the reason, never hidden.
- **Fit & size panel** with a to-scale parametric SVG preview per garment
  (front / back / sleeve), garment-specific size charts in inches and cm,
  S–5XL, and per-size scaling bands.
- **True-scale previews.** Geometry is derived from each garment's size chart at a
  fixed units-per-inch, so changing size grows the garment while a print area stays
  the same physical size — which is the relationship that matters before you commit
  artwork.
- **The style/feel form** — theme, niche, audience, occasion, style (max 3), mood,
  detail level, era, layout archetype, text treatment, headline/subline, type
  pairing, palette, print method, seed and variation count.
- **Print method as a real constraint.** Method drives the colour ceiling, whether
  gradients are possible, minimum stroke width, and how much detail will survive.
  Switching to a method with a lower ceiling trims the palette rather than leaving
  an unexportable spec; palettes that exceed the ceiling are disabled, not truncated.
- **Ink separation checking in CIE Lab.** Every ink is compared to the garment
  colour with ΔE2000, and flagged when it drops below the point where it stops
  reading on fabric. Navy on black fails this; navy on sand passes.
- **A constraint pass** separating errors that block export from warnings the
  seller can knowingly override — see `src/lib/designSpec.js`.
- **A live design brief** in both structured JSON and prose. This is what the
  composer and the Gemini step will consume, and it is usable on its own today:
  copy it into any image tool.

- **The SVG composer.** A brief becomes real vector artwork: seven layout
  archetypes, eight procedural motif families chosen by style, seven text
  treatments, and a distress mask for the worn styles. Authored at 100 units per
  inch so export to 300 DPI is a pure scale with no re-layout.
- **Deterministic output.** A seeded PRNG means the same seed and the same fields
  always produce byte-identical artwork — a design can be reprinted a year later.
- **Text that cannot overflow.** Lines are fitted with `textLength` +
  `lengthAdjust` instead of glyph measurement, so a line occupies exactly the width
  the layout allocated whatever font the renderer resolves.
- **300 DPI export** with genuinely transparent backgrounds, plus source SVGs with
  the typeface embedded as base64 `@font-face`, a tech pack, and the brief — all in
  one zip.
- **Product view.** The composed artwork renders onto the garment silhouette at
  true scale, in the chosen garment colour.
- **Worn model shots** via Gemini image-to-image: the composed artwork is sent as a
  conditioning image so the model wears that exact design rather than an
  approximation of it.

Not yet built: the collections/batch features for sellers, listing metadata
generation, and the Gemini text step that enriches a brief before composition.

## The output pipeline

```
form  →  brief (JSON)  →  composer  →  SVG at true physical size
                                        ├─ 300 DPI transparent PNG   (print)
                                        ├─ SVG + embedded font       (vector source)
                                        ├─ on-garment product view   (preview)
                                        └─ Gemini image-to-image     (worn model shot)
```

Two things that are easy to get wrong and are handled deliberately:

- **Fonts.** An SVG rasterised through `Image()` renders in an isolated context
  that cannot see the page's webfonts, so exported text would silently fall back to
  a default face. The font bytes are fetched and inlined as base64 `@font-face`
  before rasterising. See `src/lib/fonts.js`.
- **Conditioning image size.** A full 3600×4800 separation base64-encodes to
  several megabytes and exceeds the function's body limit, so the model shot is
  conditioned on a 1024px downscale — far more than enough to reproduce the art.

## Running locally

```bash
npm install
npm run dev
```

## Configuring the Gemini key

The key is read server-side only, by a Netlify function. It must never appear in
client code or in the repo.

The variable is named **`GEMINI_API_KEY_SG`**. Server code reads it through the
single accessor in `netlify/functions/_config.js` — never inline the name elsewhere,
so renaming it later is a one-line change.

1. Netlify dashboard → your site → **Site configuration → Environment variables**
2. **Add a variable**
   - **Key:** `GEMINI_API_KEY_SG` — this field is the variable *name*. It accepts
     only letters, numbers and underscores, so pasting the key itself here is
     rejected.
   - **Value:** the actual key. Under **Values**, either pick *Same value for all
     deploy contexts* and paste it once, or paste it into **Production** and
     **Deploy Previews** separately.
3. Leave **Secret** ticked, and keep the Builds / Functions / Runtime scopes.

For local development, copy `.env.example` to `.env` and fill it in — `.env` is
gitignored.

## Layout

```
src/data/garments.js      garment catalogue + per-garment print-area maps
src/data/sizeCharts.js    size charts by fit family, size bands
src/data/placements.js    placement definitions, measured from HPS
src/data/printMethods.js  print methods and what each can physically reproduce
src/data/vocabularies.js  style, feel, era, typography and palette vocabularies
src/lib/silhouette.js     parametric garment geometry (one builder, not 25 drawings)
src/lib/colour.js         CIE Lab conversion, ΔE2000, ink separation checks
src/lib/designSpec.js     spec model, constraint pass, brief builder
src/lib/composer.js       brief -> vector artwork, deterministic from seed
src/lib/motifs.js         procedural motif families, mapped to styles
src/lib/rng.js            seeded PRNG for reproducibility
src/lib/fonts.js          font inlining so exports keep the right typeface
src/lib/export.js         300 DPI rasterisation, zip pack builder
src/components/           garment picker, fit & size panel, placement map
src/pages/Studio.jsx      the studio screen
netlify/functions/        server-side Gemini proxy
  _config.js              env accessor — the only place the key name appears
  model-shot.js           Gemini image-to-image worn product shot
```

## A note on the size charts

The values in `src/data/sizeCharts.js` are industry-typical reference dimensions.
Blanks vary meaningfully between brands — confirm against your supplier's spec
sheet before committing a print run.
