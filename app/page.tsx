'use client'

import Link from 'next/link'
import { useTarot } from '@/hooks/useTarot'
import QuestionForm from '@/components/tarot/QuestionForm'
import CardReveal from '@/components/tarot/CardReveal'
import ReadingResult from '@/components/tarot/ReadingResult'
import StarField from '@/components/ui/StarField'
import LimitBanner from '@/components/ui/LimitBanner'

export default function Home() {
  const { step, reading, error, isPremium, limitReached, submit, reset } = useTarot()

  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />

      {/* ヘッダー */}
      <header className="relative z-10 text-center pt-10 pb-4 px-4">
        <div className="inline-block">
          <p className="text-xs tracking-[0.5em] text-amber-400/70 mb-2 uppercase">Ancient Wisdom × AI</p>
          <h1 className="text-4xl md:text-5xl font-bold gold-shimmer mb-1">月詠タロット</h1>
          <p className="text-sm text-purple-300/80 tracking-widest">つくよみ たろっと</p>
        </div>

        {/* ナビ */}
        <nav className="flex justify-center gap-4 mt-4">
          <Link href="/history" className="text-xs text-purple-400/50 hover:text-purple-300 transition-colors tracking-wider">
            ☽ 鑑定履歴
          </Link>
          {isPremium ? (
            <span className="text-xs text-amber-400/70 tracking-wider">✦ プレミアム</span>
          ) : (
            <Link href="/upgrade" className="text-xs text-amber-400/50 hover:text-amber-300 transition-colors tracking-wider">
              ✦ プレミアムへ
            </Link>
          )}
        </nav>
      </header>

      {/* メインコンテンツ */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-16">
        {error && (
          <div className="mb-6 mt-4 p-4 rounded-xl border border-red-500/30 bg-red-950/30 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {limitReached && step === 'input' && <LimitBanner />}

        {!limitReached && step === 'input' && (
          <QuestionForm onSubmit={submit} />
        )}

        {step === 'drawing' && reading && (
          <CardReveal drawnCards={reading.drawnCards} />
        )}

        {step === 'result' && reading && (
          <ReadingResult reading={reading} onReset={reset} />
        )}
      </div>

      <footer className="relative z-10 text-center py-6 text-purple-400/50 text-xs">
        <p>© 2026 月詠タロット — AIによる占いはエンターテインメントです</p>
      </footer>
    </main>
  )
}
