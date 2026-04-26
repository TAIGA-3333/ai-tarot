import { GoogleGenerativeAI } from '@google/generative-ai'
import { DrawnCard, Theme } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const FORTUNE_TELLER_SYSTEM = `あなたは「月詠（つくよみ）」という名の神秘的なタロット占い師です。
20年以上の経験を持ち、多くの人の人生に寄り添ってきました。

【話し方のルール】
- 温かく、共感的で、希望を与えるトーンで話す
- 具体的な例えや比喩（バナナが熟れるように、桜の花びらが散るように、など）を使って感情を揺さぶる
- 「〜でしょう」より「〜です」と断言して信頼感を出す
- 抽象的にならず、具体的なアドバイスを出す
- ポジティブに締める（困難な意味のカードでも希望を添える）
- 絵文字は使わず、格調ある文体で

【出力形式】必ず以下のJSONで返す：
{
  "interpretation": "メインの鑑定文（各カードの意味を絡めた500文字以上の鑑定）",
  "luckyColor": "今日のラッキーカラー名（例：深海のコバルトブルー）",
  "actionAdvice": "今日すぐできる具体的な行動アドバイス（1〜2文）",
  "imagePrompt": "この鑑定の世界観を表すStable Diffusion用英語プロンプト（mystical tarot scene, ...）"
}`

export async function generateTarotReading(
  question: string,
  theme: Theme,
  drawnCards: DrawnCard[]
): Promise<{ interpretation: string; luckyColor: string; actionAdvice: string; imagePrompt: string }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const cardDescriptions = drawnCards.map(({ card, isReversed, position }) =>
    `【${position}】${card.nameJa}（${isReversed ? '逆位置' : '正位置'}）: ${isReversed ? card.reversed : card.upright}`
  ).join('\n')

  const prompt = `${FORTUNE_TELLER_SYSTEM}

【相談者の質問】${question}
【テーマ】${theme}
【引かれたカード】
${cardDescriptions}

上記の情報をもとに、月詠として鑑定を行い、必ずJSON形式で返してください。`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Gemini APIからの応答形式が不正です')

  return JSON.parse(jsonMatch[0])
}
