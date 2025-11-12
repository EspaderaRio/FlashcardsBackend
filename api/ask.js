// api/ask.js
import OpenAI from "openai";

/**
 * Dynamic CORS: allows requests from:
 * - GitHub Pages
 * - localhost / Live Server
 * - Any Vercel preview or production deployment
 */
const isAllowedOrigin = (origin) => {
  if (!origin) return false;

  // Allow localhost / Live Server
  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) return true;

  // Allow GitHub Pages
  if (origin.endsWith("github.io")) return true;

  // Allow Vercel domains (preview or prod)
  if (origin.endsWith("vercel.app")) return true;

  return false;
};

export default async function handler(req, res) {
  const origin = req.headers.origin;

  // Set CORS headers dynamically
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
