import { useState } from 'react'

export default function BriefPreview({ brief, prompt, blocked }) {
  const [tab, setTab] = useState('prompt')
  const [copied, setCopied] = useState(false)
  const text = tab === 'prompt' ? prompt : JSON.stringify(brief, null, 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-xl border border-edge bg-panel/50">
      <div className="flex items-center justify-between gap-2 border-b border-edge px-3 py-2">
        <div className="flex rounded-lg border border-edge bg-panel p-0.5">
          {['prompt', 'json'].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`rounded-md px-2.5 py-1 text-xs capitalize transition-colors ${
                tab === t ? 'bg-white/12 text-white' : 'text-muted hover:text-white'
              }`}>{t}</button>
          ))}
        </div>
        <button type="button" onClick={copy}
          className="rounded-lg border border-edge px-2.5 py-1 text-xs text-muted transition-colors hover:text-white">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-[340px] overflow-auto whitespace-pre-wrap break-words px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
        {text}
      </pre>
      <p className="border-t border-edge px-3 py-2 text-[11px] leading-relaxed text-muted">
        {blocked
          ? 'Fix the blocking issues above before generating — the brief is shown so you can see what changes.'
          : 'This is exactly what the composer and the Gemini brief step receive. Usable on its own: paste it into any image tool today.'}
      </p>
    </div>
  )
}
