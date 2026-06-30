const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Gemini API Key:', apiKey ? 'FOUND' : 'MISSING');
  if (!apiKey) return;

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    console.log('Testing gemini-2.5-flash...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, respond with exactly "OK" in Portuguese.',
    });
    console.log('Response:', response.text);
  } catch (err) {
    console.error('gemini-2.5-flash failed:', err.message || err);
    
    // Try gemini-1.5-flash as fallback
    try {
      console.log('Testing gemini-1.5-flash...');
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: 'Hello, respond with exactly "OK" in Portuguese.',
      });
      console.log('Response:', response.text);
    } catch (err2) {
      console.error('gemini-1.5-flash failed:', err2.message || err2);
    }
  }
}

main().catch(console.error);
