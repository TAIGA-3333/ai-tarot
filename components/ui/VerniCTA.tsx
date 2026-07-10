'use client'

import { trackEvent } from '@/lib/track'

/**
 * ヴェルニ アフィリエイト枠。
 * 登録待ちのため NEXT_PUBLIC_VERNI_URL 未設定時は何も描画しない
 * （導線はLINE単一CTAのみに絞る）。登録後にVercel環境変数を設定するだけで
 * コード変更なしに有効化できる。
 */
export default function VerniCTA() {
  const verniUrl = process.env.NEXT_PUBLIC_VERNI_URL
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
