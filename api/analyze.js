export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY_Root;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY_Root not set in Vercel' });

  const { image_data, media_type } = req.body;
  if (!image_data || !media_type) return res.status(400).json({ error: 'Missing fields' });

  const prompt = `You are an expert Android device analyst. Analyze this About Phone screenshot and respond ONLY in this exact JSON (no markdown, no extra text):
{
  "device_info": {
    "brand": "Brand or Unknown",
    "model": "Model or Unknown",
    "android_version": "Android version or Unknown",
    "security_patch": "Date or Unknown",
    "build_number": "Build or Unknown",
    "processor": "Chipset or Unknown",
    "ui_version": "UI version or Unknown",
    "ram": "RAM or Unknown",
    "storage": "Storage or Unknown"
  },
  "root_status": "rootable",
  "root_verdict": "One line verdict",
  "reasons": ["Reason 1", "Reason 2", "Reason 3"]
}
root_status must be exactly: rootable, not_rootable, or unknown. Write reasons in simple English.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: media_type, data: image_data } },
            { text: prompt }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
