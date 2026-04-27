'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import StarField from '@/components/ui/StarField'
import { setIsPremium, getIsPremium } from '@/lib/storage'

const FEATURES = [
  { icon: '✦', title: '無制限の鑑定', desc: '1日何度でもタロットを引けます' },
  { icon: '☽', title: '詳細な5枚展開', desc: '3枚→5枚スプレッドで深い洞察を' },
  { icon: '◈', title: '鑑定履歴50件保存', desc: '過去の鑑定をいつでも振り返れます' },
  { icon: '✵', title: '優先AIモデル', desc: 'より精度の高い鑑定文を生成' },
]

export default function UpgradePage() {
  const searchParams = useSearchParams()
  const [isPremium, setIsPremiumState] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'canceled'>('idle')

  // 決済成功後のリダイレクト処理
  const verifySession = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`)
      const data = await res.json()
      if (data.isPremium) {
        setIsPremium(true)
        setIsPremiumState(true)
        setStatus('success')
      }
    } catch {
      // 検証失敗時は何もしない
    }
  }, [])

  useEffect(() => {
    setIsPremiumState(getIsPremium())

    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')

    if (success === '1' && sessionId) {
      verifySession(sessionId)
    } else if (canceled === '1') {
      setStatus('canceled')
    }
  }, [searchParams, verifySession])

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: crypto.randomUUID() }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('決済ページの準備に失敗しました。しばらくしてから再度お試しください。')
        setIsLoading(false)
      }
    } catch {
      alert('通信エラーが発生しました。')
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-400/60 text-sm hover:text-purple-300 transition-colors mb-8">
          ← 占い画面に戻る
        </Link>

        {/* 成功バナー */}
        {status === 'success' && (
          <div className="mb-6 p-4 rounded-2xl border border-amber-400/40 bg-amber-950/30 text-amber-300 text-sm text-center">
            ✦ プレミアムプランへようこそ！無制限で占えます。
          </div>
        )}

        {/* キャンセルバナー */}
        {status === 'canceled' && (
          <div className="mb-6 p-4 rounded-2xl border border-purple-500/30 bg-purple-950/30 text-purple-300 text-sm text-center">
            決済をキャンセルしました。いつでも再挑戦できます。
          </div>
        )}

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
          <div className="text-5xl font-bold text-amber-300 mb-1">¥490</div>
          <p className="text-purple-300/60 text-sm mb-6">/ 月（税込）</p>

          {isPremium ? (
            <div className="py-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-sm font-bold">
              ✦ プレミアムプラン利用中
            </div>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="
                w-full py-5 rounded-2xl font-bold text-lg tracking-wider
                bg-gradient-to-r from-amber-700/80 via-amber-500/90 to-amber-700/80
                text-amber-100 border border-amber-400/40
                shadow-[0_0_30px_rgba(201,168,76,0.4)]
                hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]
                transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-amber-300/40 border-t-amber-300 rounded-full animate-spin" />
                  Stripeに接続中...
                </span>
              ) : (
                '✦ 今すぐ始める（Stripe決済）'
              )}
            </button>
          )}

          <p className="text-purple-400/40 text-xs mt-3">いつでもキャンセル可能 · SSL暗号化通信</p>
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
          Stripeによる安全な決済処理 · カード情報は当サービスに保存されません
        </p>
      </div>
    </main>
  )
}
