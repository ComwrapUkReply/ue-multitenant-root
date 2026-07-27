/**
 * Reference edge handler for POST /api/seo-generate
 * Copy to your serverless platform (Netlify, Vercel, Cloudflare, App Builder).
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const {
    schemaType, title, description, aiProvider = 'openai',
  } = body || {};

  if (!schemaType) {
    res.status(400).json({ success: false, error: 'schemaType is required' });
    return;
  }

  const systemPrompt = 'You output only valid JSON-LD for schema.org. No markdown.';
  const userPrompt = JSON.stringify({ schemaType, title, description });

  if (aiProvider === 'gemini') {
    const key = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    if (!key) {
      res.status(503).json({ success: false, error: 'GEMINI_API_KEY not configured' });
      return;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const geminiResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n${userPrompt}` }] }],
      }),
    });
    const geminiData = await geminiResp.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ success: true, providerId: 'gemini', jsonLd: text });
    return;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!openaiKey) {
    res.status(503).json({ success: false, error: 'OPENAI_API_KEY not configured' });
    return;
  }

  const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  const openaiData = await openaiResp.json();
  const jsonLd = openaiData?.choices?.[0]?.message?.content || '';
  res.status(200).json({ success: true, providerId: 'openai', jsonLd });
}
