'use client'

import { TarotReading } from '@/types'
import ShareButton from '@/components/ui/ShareButton'

interface Props {
  reading: TarotReading
  onReset: () => void
}

const CARD_SYMBOLS = ['☽', '✦', '◈']

export default function ReadingResult({ reading, onReset }: Props) {
  return (
    <div className="mt-8 space-y-6">
      {/* 引いたカード表示 */}
      <div className="flex justify-center gap-3 flex-wrap">
        {reading.drawnCards.map((drawn, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-xs text-amber-400/60">{drawn.position}</span>
            <div className="
              w-20 h-32 rounded-xl border-2 border-amber-400/50
              bg-gradient-to-b from-purple-900 to-purple-950
              flex flex-col items-center justify-center
              shadow-[0_0_20px_rgba(201,168,76,0.3)]
              float-animation
            ">
              <div className="text-xl mb-1">{CARD_SYMBOLS[i]}</div>
              <div className={`text-[10px] text-amber-300 text-center px-1 leading-tight font-bold ${drawn.isReversed ? 'rotate-180' : ''}`}>
                {drawn.card.nameJa}
              </div>
              {drawn.isReversed && <div className="text-[8px] text-purple-400/60 mt-0.5">逆位置</div>}
            </div>
          </div>
        ))}
      </div>

      {/* 鑑定本文 */}
      <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-b from-purple-950/80 to-black/60 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-amber-400 text-lg">☽</span>
          <h2 className="text-sm tracking-widest text-amber-400/80 uppercase">月詠からの鑑定</h2>
        </div>
        <p className="text-purple-100/90 text-sm leading-[2] whitespace-pre-line">
          {reading.interpretation}
        </p>
      </div>

      {/* ラッキーカラー & アドバイス */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-purple-300">◉</span>
            <h3 className="text-xs tracking-widest text-purple-300/70 uppercase">今日のラッキーカラー</h3>
          </div>
          <p className="text-amber-300 font-bold text-base">{reading.luckyColor}</p>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400">✦</span>
            <h3 className="text-xs tracking-widest text-amber-400/70 uppercase">今日の行動アドバイス</h3>
          </div>
          <p className="text-purple-100/90 text-sm leading-relaxed">{reading.actionAdvice}</p>
        </div>
      </div>

      {/* 画像生成プロンプト（コピー用） */}
      <details className="rounded-2xl border border-purple-500/15 bg-purple-950/20 p-4">
        <summary className="text-xs text-purple-400/50 cursor-pointer tracking-wider select-none">
          ✦ AI画像生成プロンプト（クリックで展開）
        </summary>
        <div className="mt-3 p-3 rounded-xl bg-black/30 border border-purple-500/10">
          <p className="text-purple-300/60 text-xs font-mono break-all leading-relaxed">
            {reading.imagePrompt}
          </p>
        </div>
      </details>

      {/* シェア & リセット */}
      <div className="flex flex-col sm:flex-row gap-3">
        <ShareButton reading={reading} />
        <button
          onClick={onReset}
          className="
            flex-1 py-4 rounded-2xl border border-purple-500/30
            text-purple-300/70 text-sm tracking-wider
            hover:border-purple-400/50 hover:text-purple-200
            transition-all duration-300
          "
        >
          もう一度占う
        </button>
      </div>
    </div>
  )
}
