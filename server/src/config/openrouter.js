import https from 'https';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const callOpenRouter = async ({ systemPrompt, userPrompt, temperature = 0.3 }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing');
  }

  const payload = JSON.stringify({
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  const response = await new Promise((resolve, reject) => {
    const req = https.request(
      OPENROUTER_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'HTTP-Referer': process.env.APP_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173',
          'X-Title': 'AI Career Portal'
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const parsed = safeJsonParse(data);
          if (!parsed) {
            return reject(new Error('Invalid JSON from OpenRouter transport response'));
          }

          if (res.statusCode >= 400) {
            return reject(new Error(parsed.error?.message || 'OpenRouter request failed'));
          }

          const text = parsed.choices?.[0]?.message?.content;
          if (!text) {
            return reject(new Error('No content in OpenRouter response'));
          }

          const structured = safeJsonParse(text);
          if (!structured) {
            return reject(new Error('OpenRouter returned non-JSON content'));
          }

          resolve(structured);
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });

  return response;
};
