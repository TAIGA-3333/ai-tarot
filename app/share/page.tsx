import type { Metadata } from 'next'
import Link from 'next/link'
import StarField from '@/components/ui/StarField'
import omensData from '@/lib/omens.json'
import ShareAutoRedirect from './ShareAutoRedirect'

type Omen = (typeof omensData)[0]

interface Props {
  searchParams: Promise<{ omen?: string; msg?: string }>
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kaiun-oracle.vercel.app'

function resolveOmen(omenId: string | undefined): Omen {
  return omensData.find((o) => o.id === omenId) || omensData[0]
}

// U1: シェアされた結果ページ専用のOGPメタデータ。
// クローラー（X/LINEのリンク展開bot）はここで生成された /api/og/result 画像を読み取り、
// 「結果カード」としてタイムライン上に展開する。
// ※ これがないと下の SharePage 本体がリダイレクトするだけの空ページになり、
//    シェアした本人の結果ではなく汎用トップページの画像しか表示されない（旧実装のバグ）。
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { omen: omenId, msg } = await searchParams
  const omen = resolveOmen(omenId)
  const message = msg || '今日あなたに必要なスピリチュアルメッセージ'
  const title = `${omen.nameJa}があなたを選びました — 開運オラクル`
  const description = `「${message.slice(0, 60)}」`
  const ogImage = `/api/og/result?omen=${encodeURIComponent(omen.id)}&msg=${encodeURIComponent(message)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${APP_URL}/share?omen=${encodeURIComponent(omen.id)}&msg=${encodeURIComponent(message)}`,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function SharePage({ searchParams }: Props) {
  const { omen: omenId, msg } = await searchParams
  const omen = resolveOmen(omenId)
  const message = msg || ''

  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />
      <ShareAutoRedirect />

      <div className="relative z-10 mx-auto max-w-xl px-4 py-16 text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.4em] text-amber-400/70">Shared Oracle Result</p>

        <div
          className="relative mx-auto flex h-64 w-48 flex-col items-center justify-center rounded-3xl border-2 bg-gradient-to-b from-purple-900 via-purple-950 to-black/80 backdrop-blur-sm"
          style={{ borderColor: omen.color + '80' }}
        >
          <div
            className="absolute inset-0 rounded-3xl opacity-20"
            style={{ background: `radial-gradient(circle at 50% 40%, ${omen.color}, transparent 70%)` }}
          />
          <span className="relative z-10 mb-3 text-7xl">{omen.emoji}</span>
          <p className="relative z-10 text-xl font-bold" style={{ color: omen.color }}>
            {omen.nameJa}
          </p>
          <p className="relative z-10 mt-1 text-xs text-purple-300/60">{omen.attribute}</p>
        </div>

        <h1 className="mt-8 text-2xl font-bold gold-shimmer">{omen.nameJa}があなたを選びました</h1>
        {message && (
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-purple-100/80">「{message}」</p>
        )}

        <Link
          href="/?src=share"
          className="
            mt-10 inline-flex items-center gap-2 rounded-full
            bg-gradient-to-r from-amber-700/80 via-amber-500/90 to-amber-700/80
            px-8 py-4 text-sm font-bold tracking-wider text-amber-100
            border border-amber-400/40 shadow-[0_0_30px_rgba(201,168,76,0.4)]
            transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]
          "
        >
          🌟 あなたも今日のメッセージを受け取る 🌟
        </Link>
        <p className="mt-4 text-xs text-purple-400/40">数秒後に自動的に移動します…</p>
      </div>
    </main>
  )
}
