import type { Metadata } from 'next'
import StarField from '@/components/ui/StarField'

export const metadata: Metadata = {
  title: 'TikTok連携テスト — 開運オラクル',
  robots: { index: false, follow: false },
}

export default function TikTokConnectPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-16 pb-16 text-center">
        <p className="text-xs tracking-[0.5em] text-amber-400/70 mb-2 uppercase">TikTok API Integration</p>
        <h1 className="text-3xl md:text-4xl font-bold gold-shimmer mb-4">TikTok連携テスト</h1>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/40 p-5 mb-8 text-left">
          <p className="text-purple-100/90 text-sm leading-relaxed">
            これは TikTok API 連携のテスト用ページです。<br />
            下のボタンを押すと TikTok のログイン・許可画面に移動し、許可すると開運オラクルのアカウントと連携されます。
            連携後、テスト用の動画（公開範囲: 自分のみ）を1件投稿する処理までを確認できます。
          </p>
        </div>

        <a
          id="tiktok-connect-btn"
          href="/api/tiktok/authorize"
          className="
            inline-flex items-center gap-2 px-8 py-4 rounded-2xl
            bg-gradient-to-r from-amber-700/80 via-amber-500/90 to-amber-700/80
            text-amber-100 text-base font-bold tracking-wider
            border border-amber-400/40
            shadow-[0_0_30px_rgba(201,168,76,0.4)]
            hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]
            transition-all duration-300
          "
        >
          🎵 TikTokと連携する
        </a>

        <p className="text-purple-400/40 text-xs mt-6">
          ※ 連携は開発・審査確認目的のみです。投稿は必ず「自分のみ」の公開範囲で行われます。
        </p>
      </div>
    </main>
  )
}
