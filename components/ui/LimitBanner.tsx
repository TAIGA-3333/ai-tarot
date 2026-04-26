'use client'

import Link from 'next/link'

export default function LimitBanner() {
  return (
    <div className="mt-8 rounded-2xl border border-amber-400/30 bg-gradient-to-b from-amber-950/40 to-purple-950/60 p-8 text-center">
      <div className="text-4xl mb-4">🌙</div>
      <h2 className="text-xl font-bold gold-shimmer mb-3">今日の無料鑑定は終了しました</h2>
      <p className="text-purple-200/70 text-sm leading-relaxed mb-6">
        無料プランは1日1回まで。<br />
        月詠はまた明日、あなたの問いに答えます。<br /><br />
        <span className="text-amber-300/80">今すぐ鑑定を続けたい方は、月額490円のプレミアムプランへ。</span>
      </p>

      <div className="space-y-3">
        <Link
          href="/upgrade"
          className="
            block w-full py-4 rounded-2xl font-bold text-base
            bg-gradient-to-r from-amber-700/80 via-amber-500/90 to-amber-700/80
            text-amber-100 border border-amber-400/40
            shadow-[0_0_30px_rgba(201,168,76,0.4)]
            hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]
            transition-all duration-300 hover:scale-[1.02]
          "
        >
          ✦ 月額490円で無制限に占う
        </Link>

        <p className="text-purple-400/40 text-xs">
          ※ 明日0時にリセットされます
        </p>
      </div>
    </div>
  )
}
