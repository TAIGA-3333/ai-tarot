import { NextRequest, NextResponse } from 'next/server'
import { drawCards } from '@/lib/tarot/cards'
import { generateTarotReading } from '@/lib/gemini'
import { Theme } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { question, theme, cardCount = 3 } = await req.json()

    if (!question || question.trim().length < 5) {
      return NextResponse.json({ error: "質問を5文字以上入力してください" }, { status: 400 })
    }

    const drawnCards = drawCards(cardCount)
    const result = await generateTarotReading(question, theme as Theme, drawnCards)

    return NextResponse.json({
      drawnCards,
      interpretation: result.interpretation,
      luckyColor: result.luckyColor,
      actionAdvice: result.actionAdvice,
      imagePrompt: result.imagePrompt,
    })
  } catch (err: unknown) {
    console.error("[tarot/draw] Error:", err)

    const errorMessage =
      err instanceof Error ? err.message : "鑑定中にエラーが発生しました。もう一度お試しください。"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
