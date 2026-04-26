'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TarotReading } from '@/types'
import { getReadings } from '@/lib/storage'
import StarField from '@/components/ui/StarField'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function HistoryPage() {
  const [readings, setReadings] = useState<TarotReading[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setReadings(getReadings())
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-400/60 text-sm hover:text-purple-300 transition-colors mb-8">
          ← 占い画面に戻る
        </Link>

        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] text-amber-400/70 mb-2 uppercase">Reading History</p>
          <h1 className="text-3xl font-bold gold-shimmer">鑑定の記録</h1>
        </div>

        {readings.length === 0 ? (
          <div className="text-center py-20 text-purple-400/50">
            <p className="text-4xl mb-4">☽</p>
            <p className="text-sm">まだ鑑定記録がありません</p>
            <Link href="/" className="inline-block mt-4 text-amber-400/70 text-sm hover:text-amber-300 transition-colors">
              最初の占いを始める →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {readings.map(r => (
              <div
                key={r.id}
                className="rounded-2xl border border-purple-500/20 bg-purple-950/40 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setExpanded(expanded === r.id ? null : (r.id ?? null))}
                  className="w-full text-left p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full border border-amber-400/30 text-amber-400/70">{r.theme}</span>
                      <span className="text-xs text-purple-400/40">{r.createdAt ? formatDate(r.createdAt) : ''}</span>
                    </div>
                    <p className="text-purple-100/80 text-sm truncate">{r.question}</p>
                    <p className="text-purple-400/50 text-xs mt-1">
                      {r.drawnCards.map(d => d.card.nameJa).join(' · ')}
                    </p>
                  </div>
                  <span className={`text-purple-400/50 text-xs transition-transform duration-300 mt-1 ${expanded === r.id ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {expanded === r.id && (
                  <div className="px-5 pb-5 border-t border-purple-500/10 pt-4 space-y-4">
                    <p className="text-purple-100/80 text-sm leading-[1.9] whitespace-pre-line">
                      {r.interpretation}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-purple-900/30 p-3">
                        <p className="text-xs text-purple-400/50 mb-1">ラッキーカラー</p>
                        <p className="text-amber-300 text-sm font-bold">{r.luckyColor}</p>
                      </div>
                      <div className="rounded-xl bg-purple-900/30 p-3">
                        <p className="text-xs text-purple-400/50 mb-1">行動アドバイス</p>
                        <p className="text-purple-100/80 text-xs leading-relaxed">{r.actionAdvice}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
