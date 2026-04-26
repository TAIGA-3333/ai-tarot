import Link from 'next/link'
import StarField from '@/components/ui/StarField'

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <StarField />
      <div className="relative z-10 text-center px-4">
        <div className="text-7xl mb-6 float-animation">☽</div>
        <h1 className="text-6xl font-bold gold-shimmer mb-4">404</h1>
        <p className="text-purple-200/70 text-sm leading-relaxed mb-8">
          このページは星の彼方へ消えてしまいました。<br />
          カードが示す道は、別のところにあるようです。
        </p>
        <Link
          href="/"
          className="
            inline-block px-8 py-4 rounded-2xl font-bold
            bg-gradient-to-r from-amber-700/80 via-amber-500/90 to-amber-700/80
            text-amber-100 border border-amber-400/40
            shadow-[0_0_30px_rgba(201,168,76,0.4)]
            hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]
            transition-all duration-300 hover:scale-[1.02]
          "
        >
          ✦ 占い画面へ戻る
        </Link>
      </div>
    </main>
  )
}
