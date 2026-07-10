'use client'

import { trackEvent } from '@/lib/track'

// LINE公式アカウント @101ebuku の友だち追加URL（環境変数で上書き可能）
const DEFAULT_LINE_URL = 'https://line.me/R/ti/p/%40101ebuku'

interface Props {
  omenName?: string
}

export default function LineCTA({ omenName }: Props) {
  const lineUrl = process.env.NEXT_PUBLIC_LINE_URL || DEFAULT_LINE_URL

  const handleClick = () => {
    trackEvent('line_cta_click', omenName ? { omenName } : {})
  }

  return (
    <a
      href={lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="
        block w-full py-5 rounded-2xl text-center font-bold text-base tracking-wide
        bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600
        text-white border border-emerald-400/40
        shadow-[0_0_30px_rgba(16,185,129,0.35)]
        hover:shadow-[0_0_45px_rgba(16,185,129,0.55)]
        transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]
      "
    >
      毎朝の運命メッセージをLINEで受け取る →
    </a>
  )
}
