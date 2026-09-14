export function Field({ label, hint, children, issue }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
        {hint && <span className="text-[11px] text-muted/70">{hint}</span>}
      </span>
      {children}
      {issue && (
        <span className={`mt-1 block text-[11px] leading-snug ${
          issue.level === 'error' ? 'text-red-400' : 'text-amber-400/90'
        }`}>{issue.message}</span>
      )}
    </label>
  )
}

export function TextInput({ value, onChange, placeholder, multiline }) {
  const cls = 'w-full rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-white ' +
              'placeholder:text-muted/50 focus:border-accent focus:outline-none'
  return multiline
    ? <textarea rows={2} className={cls + ' resize-y'} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
    : <input type="text" className={cls} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
}

export function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-white focus:border-accent focus:outline-none">
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  )
}

export function Slider({ value, onChange, min = 1, max = 5, labels }) {
  return (
    <div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#e8503a]" />
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  )
}

export function Section({ title, description, children }) {
  return (
    <section className="space-y-3.5">
      <div>
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}
