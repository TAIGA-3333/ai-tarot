import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import { GoogleGenerativeAI } from '@google/generative-ai'

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || ''
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || ''
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-line-signature')
  if (!signature) {
    return new NextResponse('Missing signature', { status: 400 })
  }

  const body = await req.text()
  
  // 署名検証
  const hash = crypto
    .createHmac('sha256', CHANNEL_SECRET)
    .update(body)
    .digest('base64')

  if (hash !== signature) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  const events = JSON.parse(body).events
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      await handleTextMessage(event)
    }
  }

  return NextResponse.json({ status: 'ok' })
}

async function handleTextMessage(event: any) {
  const userText = event.message.text
  const replyToken = event.replyToken

  // Gemini を使用して回答生成
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = `あなたは神秘的な占い師「月詠」です。LINEでユーザーから相談を受けました。
100文字以内で、優しく、かつ神秘的な口調で回答してください。
相談内容: ${userText}
`
  
  try {
    const result = await model.generateContent(prompt)
    const replyText = result.response.text()

    // LINEに返信
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken: replyToken,
        messages: [{ type: 'text', text: replyText }],
      }),
    })
  } catch (err) {
    console.error('Gemini or LINE API Error:', err)
  }
}
