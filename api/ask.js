import OpenAI from "openai";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize OpenAI with API key from environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Use chat completions API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful flashcard assistant. Help users create study materials, explain concepts, and provide learning tips. Keep responses concise and educational."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific error types
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please check your OpenAI billing.',
        details: error.message 
      });
    }
    
    if (error.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your OpenAI API key.',
        details: error.message 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.message 
    });
  }
}
