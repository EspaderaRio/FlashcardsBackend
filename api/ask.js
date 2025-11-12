// api/ask.js
import OpenAI from "openai";

export default async function handler(req, res) {
  const origin = req.headers.origin || "";

  // ✅ Allow GitHub Pages, localhost, and Vercel domains
  if (
    origin.endsWith(".github.io") ||
    origin.endsWith(".vercel.app") ||
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1")
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Must return immediately
  }

  // ✅ Only allow POST requests
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

    return res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
