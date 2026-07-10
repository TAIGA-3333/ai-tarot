import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ZODIAC_DATA, ZodiacId } from '@/lib/zodiac'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Props {
  params: Promise<{ zodiac: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zodiac } = await params
  const data = ZODIAC_DATA[zodiac as ZodiacId]
  if (!data) return {}

  const title = `今日の${data.name}の運勢 ${data.emoji} | 月詠タロット`
  const description = `今日の${data.name}の総合運、恋愛運、仕事運をチェック。AI占い師「月詠」が贈る、あなたの運気を高めるアドバイス。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // 専用OG画像ルートは未実装のためレイアウト既定の /api/og/result を継承する
    }
  }
}

export default async function ZodiacFortunePage({ params }: Props) {
  const { zodiac } = await params
  const zodiacData = ZODIAC_DATA[zodiac as ZodiacId]

  if (!zodiacData) {
    notFound()
  }

  const today = new Date().toISOString().split('T')[0]

  // Supabase から今日の運勢を取得
  const { data: fortune, error } = await supabase
    .from('zodiac_fortunes')
    .select('*')
    .eq('zodiac_id', zodiac)
    .eq('fortune_date', today)
    .single()

  return (
    <div className="min-h-screen bg-[#0a0a18] text-white font-sans selection:bg-amber-500/30">
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-amber-400/60 text-xs tracking-[0.3em] uppercase hover:text-amber-400 transition-colors">
            ← Back to Home
          </Link>
          <div className="mt-8 mb-4 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-purple-900 to-amber-900/50 border border-amber-500/20 text-5xl shadow-[0_0_50px_rgba(217,119,6,0.15)]">
            {zodiacData.emoji}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            今日の<span className="text-amber-400">{zodiacData.name}</span>の運勢
          </h1>
          <p className="mt-4 text-purple-200/60 text-sm tracking-widest uppercase">
            {today.replace(/-/g, '.')} / TSUKUYOMI FORTUNE
          </p>
        </div>

        {fortune ? (
          <div className="space-y-8">
            {/* Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard label="総合運" score={fortune.overall_score} />
              <ScoreCard label="恋愛運" score={fortune.love_score} />
              <ScoreCard label="仕事運" score={fortune.work_score} />
              <ScoreCard label="金運" score={fortune.money_score} />
            </div>

            {/* Summary */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-950/40 to-black/40 border border-amber-500/10 backdrop-blur-sm">
              <h2 className="text-amber-400 text-sm font-bold mb-4 flex items-center gap-2">
                <span className="text-lg">☽</span> 今日の運勢メッセージ
              </h2>
              <p className="text-purple-50/90 leading-[2] text-lg">
                {fortune.summary}
              </p>
            </div>

            {/* Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-purple-900/20 border border-purple-500/10">
                <p className="text-xs text-purple-400/60 uppercase tracking-widest mb-2">Lucky Item</p>
                <p className="text-amber-300 font-bold">{fortune.lucky_item}</p>
              </div>
              <div className="p-6 rounded-2xl bg-purple-900/20 border border-purple-500/10">
                <p className="text-xs text-purple-400/60 uppercase tracking-widest mb-2">Lucky Color</p>
                <p className="text-amber-300 font-bold">{fortune.lucky_color}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 rounded-3xl border border-white/5 bg-white/5">
            <p className="text-purple-300/60 italic">
              本日の運勢は現在、星が読み解き中です...<br />
              少し時間を置いてから再度お越しください。
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/20 to-purple-950/20 border border-amber-500/20">
                <h3 className="text-xl font-bold mb-4">もっと深い運命を知りませんか？</h3>
                <p className="text-sm text-purple-200/60 mb-8">
                    AIタロット占い師「月詠」が、あなたの個人的な悩みに<br className="hidden md:block" />
                    24時間いつでも寄り添い、答えを導き出します。
                </p>
                <Link href="/?src=fortune_zodiac" className="px-10 py-4 bg-amber-500 text-black font-bold rounded-full hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 inline-block">
                    縁起物からの開運メッセージを受け取る
                </Link>
            </div>
        </div>
      </main>
    </div>
  )
}

function ScoreCard({ label, score }: { label: string, score: number }) {
  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
      <p className="text-[10px] text-purple-400/60 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-2xl font-bold text-amber-300">
        {'★'.repeat(score)}{'☆'.repeat(5 - score)}
      </div>
    </div>
  )
}
