import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testGeminiModels() {
  const geminiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini Models with key:', geminiKey ? geminiKey.slice(0, 10) + '...' : 'NONE');

  const candidates = [
    'gemini-3.6-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-3.1-pro-preview'
  ];

  for (const m of candidates) {
    try {
      const start = Date.now();
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Give a 5-word math test encouragement.' }] }]
        })
      });
      const data: any = await res.json();
      const duration = Date.now() - start;
      if (res.status === 200) {
        console.log(`✅ [${m}] Status ${res.status} (${duration}ms): "${data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}"`);
      } else {
        console.log(`❌ [${m}] Status ${res.status}: ${data?.error?.message || JSON.stringify(data)}`);
      }
    } catch (e: any) {
      console.log(`⚠️ [${m}] Error: ${e.message}`);
    }
  }
}

testGeminiModels();
