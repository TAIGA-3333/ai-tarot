'use client'

import { trackEvent } from '@/lib/track'

/**
 * ヴェルニ アフィリエイト枠。
 * 2026-07-11: オーナーのヴェルニ登録完了に伴い実アフィリURLを既定値として有効化
 * （LINEステップ3通目と同一URL）。NEXT_PUBLIC_VERNI_URL を設定すれば上書きできる。
 */
const DEFAULT_VERNI_URL = 'https://afi2.vernis.co.jp/r/19du5r2'

export default function VerniCTA() {
  const verniUrl = process.env.NEXT_PUBLIC_VERNI_URL || DEFAULT_VERNI_URL
  if (!verniUrl) return null

  const handleClick = () => {
    trackEvent('verni_cta_click')
  }

  return (
    <a
      href={verniUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="
        block w-full py-4 rounded-2xl text-center text-sm tracking-wide
        border border-amber-400/30 text-amber-300/80
        hover:border-amber-400/50 hover:text-amber-200
        transition-all duration-300
      "
    >
      ✦ もっと詳しく知りたい方へ（初回無料の本格鑑定）
    </a>
  )
}
