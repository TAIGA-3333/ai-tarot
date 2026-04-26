'use client'

import { useEffect, useState } from 'react'
import { DrawnCard } from '@/types'

interface Props {
  drawnCards: DrawnCard[]
}

const CARD_SYMBOLS = ['☽', '✦', '◈', '✵', '◉']

export default function CardReveal({ drawnCards }: Props) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [phase, setPhase] = useState<'gathering' | 'revealing' | 'done'>('gathering')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('revealing'), 800)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (phase !== 'revealing') return
    if (revealedCount >= drawnCards.length) {
      setPhase('done')
      return
    }
    const t = setTimeout(() => setRevealedCount(n => n + 1), 750)
    return () => clearTimeout(t)
  }, [phase, revealedCount, drawnCards.length])

  return (
    <div className="mt-10 text-center">
      {/* フェーズメッセージ */}
      <div className="mb-8">
        {phase === 'gathering' && (
          <p className="text-purple-300/70 text-sm tracking-widest animate-pulse">
            ✦ 宇宙からカードを召喚しています ✦
          </p>
        )}
        {phase === 'revealing' && (
          <p className="text-amber-300/70 text-sm tracking-widest animate-pulse">
            ☽ カードが姿を現しています ☽
          </p>
        )}
        {phase === 'done' && (
          <p className="text-purple-300/70 text-sm tracking-widest animate-pulse">
            月詠が鑑定文を綴っています...
          </p>
        )}
      </div>

      {/* カード */}
      <div className="flex justify-center gap-5 flex-wrap">
        {drawnCards.map((drawn, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <p className="text-xs text-amber-400/60 tracking-widest">{drawn.position}</p>

            <div
              className="relative"
              style={{
                perspective: '600px',
                width: '88px',
                height: '148px',
              }}
            >
              {/* カード本体 */}
              <div
                className="absolute inset-0 rounded-2xl border-2 overflow-hidden"
                style={{
                  transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1), box-shadow 0.7s ease',
                  transform: i < revealedCount ? 'rotateY(0deg)' : 'rotateY(90deg)',
                  borderColor: i < revealedCount ? 'rgba(201,168,76,0.6)' : 'rgba(139,92,246,0.25)',
                  boxShadow: i < revealedCount
                    ? '0 0 30px rgba(201,168,76,0.4), 0 0 60px rgba(201,168,76,0.15)'
                    : 'none',
                  background: i < revealedCount
                    ? 'linear-gradient(160deg, #1e1040 0%, #0e0820 100%)'
                    : 'linear-gradient(160deg, #0e0820 0%, #06040f 100%)',
                }}
              >
                {/* カード裏面模様 */}
                {i >= revealedCount && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%),
                        repeating-linear-gradient(45deg, rgba(100,60,180,0.06) 0px, rgba(100,60,180,0.06) 1px, transparent 1px, transparent 10px)
                      `,
                    }}
                  />
                )}

                {/* カード表面 */}
                {i < revealedCount && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    {/* 上部デコ */}
                    <div className="w-full flex justify-between px-2 mb-1">
                      <span className="text-amber-400/30 text-[8px]">✦</span>
                      <span className="text-amber-400/30 text-[8px]">✦</span>
                    </div>

                    <div className="text-2xl mb-2 text-amber-300">{CARD_SYMBOLS[i % CARD_SYMBOLS.length]}</div>

                    <div
                      className={`text-[11px] font-bold text-amber-200 text-center px-1 leading-tight ${drawn.isReversed ? 'rotate-180' : ''}`}
                    >
                      {drawn.card.nameJa}
                    </div>

                    {drawn.isReversed && (
                      <div className="text-[8px] text-purple-400/60 mt-1">逆位置</div>
                    )}

                    {/* 下部デコ */}
                    <div className="w-full flex justify-between px-2 mt-1">
                      <span className="text-amber-400/30 text-[8px]">✦</span>
                      <span className="text-amber-400/30 text-[8px]">✦</span>
                    </div>
                  </div>
                )}

                {/* 裏面：中央アイコン */}
                {i >= revealedCount && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-purple-500/30 text-3xl animate-pulse">✦</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* プログレスドット */}
      <div className="flex justify-center gap-2 mt-8">
        {drawnCards.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-500"
            style={{
              background: i < revealedCount ? 'rgba(201,168,76,0.8)' : 'rgba(139,92,246,0.3)',
              boxShadow: i < revealedCount ? '0 0 6px rgba(201,168,76,0.6)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}
