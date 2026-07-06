import type { Metadata } from 'next'
import Link from 'next/link'
import StarField from '@/components/ui/StarField'
import ShareOpenTracker from '@/components/ui/ShareOpenTracker'
import { parseShareSummary } from '@/lib/share'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function toURLSearchParams(sp: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === 'string') {
      params.set(key, value)
    } else if (Array.isArray(value) && typeof value[0] === 'string') {
      params.set(key, value[0])
    }
  }
  return params
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = toURLSearchParams(await searchParams)
  const summary = parseShareSummary(params)

  const title = summary
    ? `【${summary.theme}】月詠タロットの導き — ${summary.cardNames.join('・')}`
    : '月詠タロット — AIが導く、あなたの運命'
  const description = summary
    ? `月詠が「${summary.cardNames.join('・')}」を引きました。あなたはどんなカードを引くでしょうか？`
    : 'AIタロット占いで、今日のあなたへのメッセージを受け取ってください。'

  const ogImageUrl = `/api/og?${params.toString()}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function SharePage({ searchParams }: PageProps) {
  const params = toURLSearchParams(await searchParams)
  const summary = parseShareSummary(params)
  const src = params.get('src') || 'share'

  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />
      <ShareOpenTracker src={src} theme={summary?.theme} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-xs tracking-[0.5em] text-amber-400/70 mb-3 uppercase">Ancient Wisdom × AI</p>
        <h1 className="text-3xl font-bold gold-shimmer mb-8">月詠タロット</h1>

        {summary ? (
          <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-b from-purple-950/80 to-black/60 p-8 mb-8 backdrop-blur-sm">
            <p className="text-purple-300/70 text-xs tracking-widest uppercase mb-4">
              友人が引いたカード【{summary.theme}】
            </p>
            <div className="flex justify-center gap-3 flex-wrap mb-4">
              {summary.cardNames.map((name, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-xl border border-amber-400/40 text-amber-300 text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
            {summary.luckyColor && (
              <p className="text-purple-200/70 text-sm">ラッキーカラー：{summary.luckyColor}</p>
            )}
          </div>
        ) : (
          <p className="text-purple-200/70 text-sm mb-8 leading-relaxed">
            神秘の月詠占い師が、あなたの運命を照らします。
          </p>
        )}

        <Link
          href={`/?src=${encodeURIComponent(src)}`}
          className="
            inline-block w-full py-5 rounded-2xl font-bold text-lg tracking-wider
            bg-gradient-to-r from-amber-700/80 via-amber-500/90 to-amber-700/80
            text-amber-100 border border-amber-400/40
            shadow-[0_0_30px_rgba(201,168,76,0.4)]
            hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]
            transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
          "
        >
          私も占ってもらう →
        </Link>

        <p className="mt-6 text-purple-400/40 text-xs">
          <Link href="/" className="hover:text-purple-300 transition-colors">
            月詠タロットのトップへ
          </Link>
        </p>
      </div>
    </main>
  )
}
