import Link from 'next/link'
import type { Metadata } from 'next'
import StarField from '@/components/ui/StarField'
import LineCtaButton from '@/components/ui/LineCtaButton'

export const metadata: Metadata = {
  title: '今日の開運メッセージ 12星座占い | 開運オラクル',
  description:
    '今日の運勢と開運のヒントを12星座メッセージでお届けします。さらに縁起物からの個別メッセージも受け取れます。',
  alternates: {
    canonical: '/fortune/today',
  },
}

const SIGNS = [
  '牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座',
  '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座',
]

function dailyIndex(sign: string) {
  const today = new Date().toISOString().slice(0, 10)
  return [...`${today}:${sign}`].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function messageFor(sign: string) {
  const messages = [
    '小さな違和感を見逃さない日。予定を一つ減らすと、本当に大事な声が聞こえます。',
    '人との距離感が整う日。返事を急がず、言葉を選ぶほど運気が上がります。',
    '仕事運が動く日。未完了のタスクを一つ閉じると、次の流れが入りやすくなります。',
    '恋愛運に余白が生まれる日。正解探しより、素直な一言が関係をやわらげます。',
    '金運は守りが吉。買う前に一晩置くことで、必要なものだけが残ります。',
  ]
  return messages[dailyIndex(sign) % messages.length]
}

export default function TodayFortunePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.4em] text-amber-400/70">Daily Oracle</p>
          <h1 className="gold-shimmer mb-3 text-3xl font-bold md:text-5xl">今日の開運メッセージ</h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-purple-100/70">
            12星座の今日の流れと、縁起物からの個別メッセージを受け取るための入り口です。
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNS.map((sign) => (
            <article key={sign} className="rounded-2xl border border-purple-500/20 bg-purple-950/40 p-5">
              <h2 className="mb-2 text-lg font-bold text-amber-300">{sign}</h2>
              <p className="min-h-20 text-sm leading-7 text-purple-100/80">{messageFor(sign)}</p>
              <Link
                href={`/?src=fortune_today`}
                className="mt-4 inline-flex rounded-xl border border-amber-400/30 px-4 py-2 text-xs font-bold tracking-wider text-amber-200 transition-colors hover:border-amber-300"
              >
                縁起物からのメッセージを受け取る
              </Link>
            </article>
          ))}
        </section>

        {/* U0: LINE単一CTA + クリック計測 */}
        <div className="mt-10 max-w-xl mx-auto">
          <LineCtaButton label="line_cta" />
        </div>
      </div>
    </main>
  )
}
