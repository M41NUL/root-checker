export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image_data, media_type } = req.body;

  if (!image_data || !media_type) {
    return res.status(400).json({ error: 'image_data and media_type are required' });
  }

  const prompt = `You are an expert Android device analyst. The user has uploaded a screenshot of their phone's "About Phone" or "Device Info" screen.

Analyze the screenshot carefully and extract all visible device information. Then determine if this phone model can be rooted.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "device_info": {
    "brand": "Brand name or Unknown",
    "model": "Full model name or Unknown",
    "android_version": "Android version or Unknown",
    "security_patch": "Security patch date or Unknown",
    "build_number": "Build number or Unknown",
    "processor": "Chipset or Unknown",
    "ui_version": "Custom UI (MIUI, OneUI, HiOS, etc.) or Unknown",
    "ram": "RAM or Unknown",
    "storage": "Storage or Unknown"
  },
  "root_status": "rootable" OR "not_rootable" OR "unknown",
  "root_verdict": "Short 1 line verdict in simple English",
  "reasons": [
    "Reason 1 in simple English",
    "Reason 2",
    "Reason 3"
  ]
}

Rules:
- root_status must be exactly one of: "rootable", "not_rootable", "unknown"
- If rootable: explain WHY (bootloader unlock support, known root methods, Magisk, etc.)
- If not_rootable: explain WHY NOT (locked bootloader, no unlock method, Knox, etc.)
- Write reasons in simple English that any user can understand
- Base your answer on the actual device model you see in the screenshot
- If the screenshot is not a device info page, set root_status to "unknown" and explain in reasons`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type, data: image_data }
            },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const rawText = data.content.map(i => i.text || '').join('');
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);

    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
