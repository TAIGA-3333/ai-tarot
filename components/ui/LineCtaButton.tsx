'use client'

import { LINE_URL, trackClick } from '@/lib/lineCta'

interface LineCtaButtonProps {
  /** クリック計測ラベル。funnel-report の集計キーと合わせるため既定は 'line_cta' */
  label?: string
  title?: string
  description?: string
}

/**
 * U0: fortune/history/upgrade など二次ルートに設置する共通LINE CTA。
 * トップページの結果画面にある本CTAと同一の計測仕様（/api/click, label=line_cta）で記録する。
 */
export default function LineCtaButton({
  label = 'line_cta',
  title = '毎朝の開運メッセージを受け取る',
  description = 'LINEに登録するだけ。あなたを選んだ縁起物からの守護メッセージが毎朝届きます。',
}: LineCtaButtonProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-green-900/40 via-green-700/20 to-green-900/40 border border-green-500/40 p-6 text-center">
      <p className="text-green-300/80 text-xs tracking-widest mb-1 uppercase">Daily Oracle</p>
      <h3 className="text-green-100 text-base font-bold mb-2">{title}</h3>
      <p className="text-green-200/60 text-xs mb-4 leading-relaxed">{description}</p>
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(label)}
        className="
          inline-flex items-center gap-2 px-8 py-3.5 rounded-full
          bg-[#06C755] text-white text-sm font-bold
          hover:bg-[#05b34a] hover:scale-105
          transition-all duration-300
          shadow-[0_4px_20px_rgba(6,199,85,0.4)]
        "
      >
        <svg viewBox="0 0 40 40" width="18" height="18" fill="white">
          <path d="M20 4C11.16 4 4 10.28 4 18c0 5.25 3.12 9.83 7.8 12.42-.33 1.17-.84 2.97-.97 3.43-.15.55.2.54.43.4.19-.12 2.39-1.58 3.36-2.23.97.14 1.96.21 2.98.21 8.84 0 16-6.28 16-14S28.84 4 20 4z" />
        </svg>
        無料でLINE登録する
      </a>
    </div>
  )
}
