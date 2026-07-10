/**
 * lib/gemini.ts - AI provider: Groq (free) -> Gemini (fallback)
 * GROQ_API_KEY   : console.groq.com (free, 14400 req/day)
 * GEMINI_API_KEY : aistudio.google.com (fallback, optional)
 */
import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { DrawnCard, Theme } from '@/types'

type TarotReadingResult = {
  interpretation: string
  luckyColor: string
  actionAdvice: string
  imagePrompt: string
}

const FORTUNE_TELLER_SYSTEM = `あなたは「月詠（つくよみ）」という名の神秘的なタロット占い師です。
20年以上の経験を持ち、多くの人の人生に寄り添ってきました。

「話し方のルール」
- 温かく、共感的で、希望を与えるトーンで話す
- 具体的な例えや比喩を使って感情を揺さぶる
- 「～でしょう」より「～です」と断言して信頼感を出す
- 抄象的にならず、具体的なアドバイスを出す
- ポジティブに締める
- 絵文字は使わず、格調ある文体で

「出力形式」必ず以下のJSON形式で出力してください：
{
  "interpretation": "メインの鑑定文（500文字以上）",
  "luckyColor": "今日のラッキーカラー名（例：深海のコバルトブルー）",
  "actionAdvice": "今日すぐできる具体的な行動アドバイス（1～2文）",
  "imagePrompt": "Stable Diffusion用英語プロンプト"
}`

function buildCardDescriptions(drawnCards: DrawnCard[]): string {
  return drawnCards
    .map(({ card, isReversed, position }) =>
      `《${position}》${card.nameJa}（${isReversed ? '逆位置' : '正位置'}）: ${isReversed ? card.reversed : card.upright}`
    )
    .join('\n')
}

function buildPrompt(question: string, theme: Theme, drawnCards: DrawnCard[]): string {
  return `『相談者の質問』${question}
『テーマ』${theme}
『引かれたカード』
${buildCardDescriptions(drawnCards)}

上記の情報をもとに、月詠として鑑定を行い、結果をJSON形式で出力してください。`
}

function parseJsonSafely(text: string): TarotReadingResult {
  try {
    return JSON.parse(text) as TarotReadingResult
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as TarotReadingResult
    throw new Error('出力のJSON解析に失敗しました')
  }
}

async function generateWithGroq(
  question: string, theme: Theme, drawnCards: DrawnCard[]
): Promise<TarotReadingResult> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: FORTUNE_TELLER_SYSTEM },
      { role: 'user', content: buildPrompt(question, theme, drawnCards) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.85,
    max_tokens: 1024,
  })
  const text = completion.choices[0]?.message?.content ?? ''
  if (!text) throw new Error('Groq API が空のレスポンスを返しました')
  return parseJsonSafely(text)
}

async function generateWithGemini(
  question: string, theme: Theme, drawnCards: DrawnCard[]
): Promise<TarotReadingResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })
  const prompt = `${FORTUNE_TELLER_SYSTEM}\n\n${buildPrompt(question, theme, drawnCards)}`
  const result = await model.generateContent(prompt)
  const text = result.response.text()
  if (!text) throw new Error('Gemini API が空のレスポンスを返しました')
  return parseJsonSafely(text)
}

export async function generateTarotReading(
  question: string,
  theme: Theme,
  drawnCards: DrawnCard[]
): Promise<TarotReadingResult> {
  if (process.env.GROQ_API_KEY) {
    try {
      return await generateWithGroq(question, theme, drawnCards)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('[ai] Groq failed, fallback to Gemini:', msg)
    }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      return await generateWithGemini(question, theme, drawnCards)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes('SAFETY')) {
        throw new Error('不適切な内容が含まれている可能性があるため、鑑定を中断しました。別の質問をお試しください。')
      }
      throw error
    }
  }
  throw new Error('GROQ_API_KEY または GEMINI_API_KEY を環境変数に設定してください')
}
