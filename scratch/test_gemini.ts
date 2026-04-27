import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API Key:', apiKey ? 'FOUND' : 'MISSING');
  
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const result = await model.generateContent('Hi, reply with "OK"');
    const response = await result.response;
    const text = response.text();
    console.log('Response:', text);
  } catch (error) {
    console.error('Gemini Test Error:', error);
  }
}

testGemini();
