import { geminiKey, GEMINI_KEY_VAR } from './_config.js'

const MODEL = 'gemini-3.1-flash-image'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

// Built server-side so the wording stays consistent and cannot be steered from the
// client into generating something the account should not be asking for.
function buildPrompt({ garment, colour, placement, theme, audience, styleNote }) {
  return [
    `A photorealistic e-commerce product photograph of an adult male model wearing a ${colour} ${garment}.`,
    `The garment carries the supplied graphic printed on the ${placement}.`,
    '',
    'Requirements:',
    `- Reproduce the supplied artwork exactly: same shapes, same colours, same text, same proportions. Do not redraw, restyle, translate or reinterpret it.`,
    `- Print it flat on the fabric at a realistic scale for that placement, following the garment's drape, folds and lighting.`,
    '- Neutral seamless studio backdrop, soft even key light, slight shadow under the arms.',
    '- Waist-up three-quarter framing, natural relaxed posture, hands out of the print area.',
    '- The model is a generic anonymous person, not any identifiable or public figure.',
    '- No added logos, watermarks, borders, mockup templates or extra text of any kind.',
    audience ? `- Wardrobe and styling suited to: ${audience}.` : '',
    styleNote ? `- Overall mood: ${styleNote}.` : '',
    theme ? `- The design's subject is "${theme}" — let the styling feel consistent with it.` : ''
  ].filter(Boolean).join('\n')
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  const key = geminiKey()
  if (!key) {
    return json({
      error: 'no_key',
      message: `No Gemini key configured. Set ${GEMINI_KEY_VAR} in Netlify ` +
               `(Site configuration → Environment variables) to enable model shots. ` +
               `Everything else in the app works without it.`
    }, 503)
  }

  let body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'bad_request', message: 'Body must be JSON.' }, 400)
  }

  const { imageBase64, garment, colour, placement, theme, audience, styleNote } = body || {}
  if (!imageBase64) {
    return json({ error: 'bad_request', message: 'imageBase64 (the composed artwork) is required.' }, 400)
  }

  const prompt = buildPrompt({
    garment: garment || 't-shirt',
    colour: colour || 'black',
    placement: placement || 'front chest',
    theme, audience, styleNote
  })

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/png', data: imageBase64 } }
          ]
        }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      })
    })
  } catch (e) {
    return json({ error: 'upstream_unreachable', message: 'Could not reach the Gemini API.' }, 502)
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    // Surface the status but never echo the key or full upstream payload.
    return json({
      error: 'upstream_error',
      status: res.status,
      message: res.status === 429
        ? 'Gemini rate limit or quota reached. Image generation is billed per image — check your quota.'
        : res.status === 400 && /API key/i.test(detail)
          ? `The ${GEMINI_KEY_VAR} value was rejected. Check the key is valid and not expired.`
          : `Gemini returned ${res.status}.`
    }, 502)
  }

  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts || []
  const imagePart = parts.find((p) => p.inlineData?.data || p.inline_data?.data)
  const inline = imagePart?.inlineData || imagePart?.inline_data

  if (!inline?.data) {
    const textPart = parts.find((p) => p.text)?.text
    return json({
      error: 'no_image',
      message: textPart
        ? `Gemini replied with text instead of an image: ${String(textPart).slice(0, 300)}`
        : 'Gemini returned no image. Try regenerating.'
    }, 502)
  }

  return json({
    image: inline.data,
    mime: inline.mimeType || inline.mime_type || 'image/png',
    model: MODEL
  })
}

export const config = { path: '/api/model-shot' }
