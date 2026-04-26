'use client'

import Link from 'next/link'
import StarField from '@/components/ui/StarField'
import { setIsPremium, getIsPremium } from '@/lib/storage'
import { useEffect, useState } from 'react'

const FEATURES = [
  { icon: '✦', title: '無制限の鑑定', desc: '1日何度でもタロットを引けます' },
  { icon: '☽', title: '詳細な5枚展開', desc: '3枚→5枚スプレッドで深い洞察を' },
  { icon: '◈', title: '鑑定履歴50件保存', desc: '過去の鑑定をいつでも振り返れます' },
  { icon: '✵', title: 'ラッキーカラー詳細版', desc: 'より詳しい運気アドバイスを提供' },
]

export default function UpgradePage() {
  const [isPremium, setIsPremiumState] = useState(false)

  useEffect(() => {
    setIsPremiumState(getIsPremium())
  }, [])

  // デモ用：プレミアム有効化ボタン（実際はStripe決済後にwebhookで設定）
  const handleMockUpgrade = () => {
    setIsPremium(true)
    setIsPremiumState(true)
    alert('プレミアムプランが有効になりました！（デモ）')
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">
        {/* 戻るリンク */}
        <Link href="/" className="inline-flex items-center gap-2 text-purple-400/60 text-sm hover:text-purple-300 transition-colors mb-8">
          ← 占い画面に戻る
        </Link>

        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] text-amber-400/70 mb-2 uppercase">Premium Plan</p>
          <h1 className="text-3xl font-bold gold-shimmer mb-3">月詠プレミアム</h1>
          <p className="text-purple-200/70 text-sm leading-relaxed">
            制限なく、いつでも月詠に問いかけてください。<br />
            あなたの人生の岐路に、いつも寄り添います。
          </p>
        </div>

        {/* 価格カード */}
        <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-b from-purple-950/80 to-black/60 p-8 mb-6 text-center shadow-[0_0_40px_rgba(201,168,76,0.2)]">
          <div className="text-5xl font-bold text-amber-300 mb-1">
            ¥490
          </div>
          <p className="text-purple-300/60 text-sm mb-6">/ 月（税込）</p>

          {isPremium ? (
            <div className="py-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-sm font-bold">
              ✦ プレミアムプラン利用中
            </div>
          ) : (
            <button
              onClick={handleMockUpgrade}
              className="
                w-full py-5 rounded-2xl font-bold text-lg tracking-wider
                bg-gradient-to-r from-amber-700/80 via-amber-500/90 to-amber-700/80
                text-amber-100 border border-amber-400/40
                shadow-[0_0_30px_rgba(201,168,76,0.4)]
                hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]
                transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
              "
            >
              ✦ 今すぐ始める
            </button>
          )}

          <p className="text-purple-400/40 text-xs mt-3">
            いつでもキャンセル可能
          </p>
        </div>

        {/* 機能一覧 */}
        <div className="space-y-3 mb-8">
          {FEATURES.map(f => (
            <div key={f.title} className="flex items-start gap-4 p-4 rounded-xl border border-purple-500/15 bg-purple-950/30">
              <span className="text-amber-400 text-lg mt-0.5">{f.icon}</span>
              <div>
                <p className="text-purple-100 text-sm font-bold mb-0.5">{f.title}</p>
                <p className="text-purple-400/60 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-purple-400/40 text-xs">
          Stripe決済による安全な支払い（準備中）
        </p>
      </div>
    </main>
  )
}
