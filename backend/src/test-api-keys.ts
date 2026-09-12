import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testGeminiDetailed() {
  const geminiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini with 15s timeout...');
  const models = ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-3.7-flash', 'gemini-flash-latest'];
  for (const m of models) {
    try {
      console.log(`Trying ${m}...`);
      const start = Date.now();
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Give one quick exam tip in 10 words.' }] }]
        })
      });
      const data: any = await res.json();
      console.log(`Model ${m} (${Date.now() - start}ms):`, res.status, data.candidates?.[0]?.content?.parts?.[0]?.text || data);
    } catch(e: any) {
      console.log(`Model ${m} Error:`, e.message);
    }
  }
}

testGeminiDetailed();
