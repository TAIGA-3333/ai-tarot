'use client'

import { TarotReading } from '@/types'

interface Props {
  reading: TarotReading
}

export default function ShareButton({ reading }: Props) {
  const handleShare = () => {
    const cardNames = reading.drawnCards.map(d => d.card.nameJa).join('・')
    const text = `🌙 月詠タロットで占いました\n\n【テーマ】${reading.theme}\n【引いたカード】${cardNames}\n【ラッキーカラー】${reading.luckyColor}\n\n#月詠タロット #AIタロット #タロット占い`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=550,height=420')
  }

  return (
    <button
      onClick={handleShare}
      className="
        flex-1 py-4 rounded-2xl
        bg-gradient-to-r from-slate-800 to-slate-700
        border border-slate-600/50
        text-slate-200 text-sm tracking-wider font-bold
        hover:from-slate-700 hover:to-slate-600
        hover:shadow-[0_0_20px_rgba(100,120,180,0.3)]
        transition-all duration-300 flex items-center justify-center gap-2
      "
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      Xでシェア
    </button>
  )
}
