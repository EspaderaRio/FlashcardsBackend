import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant for a flashcard-making app. Help users create questions and answers, study tips, and explain topics.',
          },
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await response.json();
    console.log('[OpenAI response]', data);
    const reply = data.choices?.[0]?.message?.content || 'No response from AI';

    res.status(200).json({ reply });
  } catch (err) {
    console.error('[ask.js] Error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
