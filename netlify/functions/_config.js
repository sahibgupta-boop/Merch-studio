// The single place the Gemini key's environment variable name appears.
// Renaming the variable in Netlify means changing this one line.
export const GEMINI_KEY_VAR = 'GEMINI_API_KEY_SG'

export const geminiKey = () => process.env[GEMINI_KEY_VAR] || null

// The app is designed to work without a key — the SVG composer falls back to
// deterministic template composition — so callers check this rather than throwing.
export const hasGeminiKey = () => Boolean(geminiKey())
