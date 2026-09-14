import Chips from './ui/Chips.jsx'
import { Field, TextInput, Select, Slider, Section } from './ui/Field.jsx'
import { STYLES, FEELS, ERAS, OCCASIONS, TEXT_TREATMENTS, FONT_PAIRINGS, LAYOUT_ARCHETYPES } from '../data/vocabularies.js'

const COMPLEXITY_LABELS = ['Minimal', '', 'Balanced', '', 'Dense']

export default function StylePanel({ spec, set, issueFor }) {
  const noText = spec.textTreatment === 'none'

  return (
    <div className="space-y-7">
      <Section title="Concept" description="What the design is about. The theme is the spine everything else hangs on.">
        <Field label="Theme" hint="required" issue={issueFor('theme')}>
          <TextInput value={spec.theme} onChange={(v) => set('theme', v)}
            placeholder="e.g. desert road trip, gym motivation, cursed fishing" />
        </Field>
        <Field label="Niche" hint="for listing keywords">
          <TextInput value={spec.niche} onChange={(v) => set('niche', v)}
            placeholder="e.g. fishing dad, software engineer humour" />
        </Field>
        <Field label="Audience">
          <TextInput value={spec.audience} onChange={(v) => set('audience', v)}
            placeholder="e.g. men 25–40, skate-adjacent, buys in packs" />
        </Field>
        <Field label="Occasion">
          <Chips options={OCCASIONS} value={spec.occasion} onChange={(v) => set('occasion', v)} />
        </Field>
      </Section>

      <Section title="Style" description="Pick up to three styles. More than that and a batch stops looking like a series.">
        <Field label="Style" hint="max 3" issue={issueFor('styles')}>
          <Chips options={STYLES} value={spec.styles} onChange={(v) => set('styles', v)} multi max={3} />
        </Field>
        <Field label="Feel" hint="mood of the piece" issue={issueFor('feels')}>
          <Chips options={FEELS} value={spec.feels} onChange={(v) => set('feels', v)} multi max={3} />
        </Field>
        <Field label="Detail level" issue={issueFor('complexity')}>
          <Slider value={spec.complexity} onChange={(v) => set('complexity', v)} labels={COMPLEXITY_LABELS} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Era cue">
            <Select value={spec.era} onChange={(v) => set('era', v)} options={ERAS} />
          </Field>
          <Field label="Layout">
            <Select value={spec.layout} onChange={(v) => set('layout', v)} options={LAYOUT_ARCHETYPES} />
          </Field>
        </div>
      </Section>

      <Section title="Typography" description="Text is composed as outlined vector paths, never as a live font the printer needs installed.">
        <Field label="Text treatment" issue={issueFor('textTreatment')}>
          <Chips options={TEXT_TREATMENTS} value={spec.textTreatment} onChange={(v) => set('textTreatment', v)} />
        </Field>
        <div className={noText ? 'pointer-events-none space-y-3.5 opacity-40' : 'space-y-3.5'}>
          <Field label="Headline" issue={issueFor('headline')}>
            <TextInput value={spec.headline} onChange={(v) => set('headline', v)}
              placeholder="The line that carries the joke or the hook" />
          </Field>
          <Field label="Secondary copy" hint="optional">
            <TextInput value={spec.subline} onChange={(v) => set('subline', v)}
              placeholder="Est. 1998 · smaller supporting line" />
          </Field>
          <Field label="Type pairing">
            <Select value={spec.fontPairing} onChange={(v) => set('fontPairing', v)}
              options={FONT_PAIRINGS.map((f) => ({ id: f.id, label: `${f.label} — ${f.mood}` }))} />
          </Field>
          <p className="text-[11px] leading-relaxed text-muted">
            All pairings are open-licence (OFL) families, so they are safe to outline and sell on merch.
          </p>
        </div>
      </Section>
    </div>
  )
}
