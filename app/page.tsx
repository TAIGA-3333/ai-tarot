'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import StarField from '@/components/ui/StarField'
import omensData from '@/lib/omens.json'
import { trackEvent } from '@/lib/track'

type Omen = (typeof omensData)[0]
type Step = 'input' | 'drawing' | 'result'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-tarot-green.vercel.app'
const LINE_URL = 'https://line.me/R/ti/p/@101ebuku'
// ヴェルニアフィリエイトURL（2026-07-08 実URLに差し替え）
const VERNIER_URL = 'https://afi2.vernis.co.jp/r/19du5r2'

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function pickOmen(input: string): Omen {
  const today = new Date().toISOString().slice(0, 10)
  const seed = hashCode(`${today}:${input}`)
  return omensData[seed % omensData.length]
}

function pickMessage(omen: Omen, input: string): string {
  const idx = hashCode(input) % omen.messages.length
  return omen.messages[idx]
}

function spawnParticles(container: HTMLElement) {
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const p = document.createElement('div')
      p.className = 'particle'
      p.style.left = `${20 + Math.random() * 60}%`
      p.style.top = `${30 + Math.random() * 40}%`
      p.style.animationDelay = `${Math.random() * 0.5}s`
      p.style.background = `hsl(${40 + Math.random() * 30}, 90%, ${60 + Math.random() * 20}%)`
      container.appendChild(p)
      setTimeout(() => p.remove(), 2500)
    }, i * 80)
  }
}

function trackClick(label: string) {
  fetch('/api/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, src: new URLSearchParams(window.location.search).get('src') ?? 'direct' }),
  }).catch(() => {})
}

export default function Home() {
  const [step, setStep] = useState<Step>('input')
  const [input, setInput] = useState('')
  const [omen, setOmen] = useState<Omen | null>(null)
  const [message, setMessage] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setStep('drawing')
    const chosen = pickOmen(input.trim())
    const msg = pickMessage(chosen, input.trim())

    // 演出タイミング
    await new Promise(r => setTimeout(r, 2800))
    setOmen(chosen)
    setMessage(msg)
    setStep('result')
    setTimeout(() => {
      setRevealed(true)
      if (resultRef.current) spawnParticles(resultRef.current)
    }, 200)
  }

  const handleReset = () => {
    setStep('input')
    setInput('')
    setOmen(null)
    setMessage('')
    setRevealed(false)
    setShareOpen(false)
  }

  const shareUrl = omen
    ? `${APP_URL}/share?omen=${encodeURIComponent(omen.id)}&msg=${encodeURIComponent(message.slice(0, 20))}`
    : ''

  const tweetText = omen
    ? `🌟 開運オラクルで「${omen.nameJa}」が降臨しました✨\n\n「${message.slice(0, 40)}…」\n\n#開運 #スピリチュアル #龍神`
    : ''

  useEffect(() => {
    // ?src=（動画/シェア等の流入元）を捕捉してページビューを記録
    trackEvent('page_view')
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />

      {/* ヘッダー */}
      <header className="relative z-10 text-center pt-10 pb-4 px-4">
        <div className="inline-block">
          <p className="text-xs tracking-[0.5em] text-amber-400/70 mb-2 uppercase">Spiritual Oracle</p>
          <h1 className="text-4xl md:text-5xl font-bold gold-shimmer mb-1">開運オラクル</h1>
          <p className="text-sm text-purple-300/80 tracking-widest">あなたを選んだ縁起物が語りかける</p>
        </div>

        {/* ナビ */}
        <nav className="flex justify-center gap-4 mt-4">
          <Link href="/fortune/today" className="text-xs text-purple-400/50 hover:text-purple-300 transition-colors tracking-wider">
            ☽ 今日の開運
          </Link>
          <Link href="/upgrade" className="text-xs text-amber-400/50 hover:text-amber-300 transition-colors tracking-wider">
            ✦ プレミアム
          </Link>
        </nav>
      </header>

      {/* メインコンテンツ */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-16">

        {/* ─── STEP: 入力 ─── */}
        {step === 'input' && (
          <div className="mt-8 oracle-enter">
            <div className="text-center mb-10">
              <div className="inline-block px-6 py-2 rounded-full border border-amber-400/30 bg-amber-400/5 mb-4">
                <span className="text-amber-300/80 text-sm tracking-wider">✦ 今日のあなたを守る縁起物が選ばれます ✦</span>
              </div>
              <p className="text-purple-200/70 text-sm leading-relaxed">
                お名前か生年月日を入力するだけ。<br />
                宇宙があなたのために縁起物を選び、<br />
                今日のスピリチュアルメッセージを届けます。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="oracle-input" className="block text-xs tracking-widest text-amber-400/70 mb-3 uppercase">
                  お名前 または 生年月日
                </label>
                <input
                  id="oracle-input"
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="例: 田中花子　または　1990/05/15"
                  className="
                    w-full rounded-2xl border border-purple-500/30 bg-purple-950/40
                    text-purple-100 placeholder-purple-400/40
                    px-5 py-4 text-sm
                    focus:outline-none focus:border-amber-400/50 focus:bg-purple-950/60
                    transition-all duration-300 backdrop-blur-sm
                  "
                />
                <p className="text-purple-400/40 text-xs mt-2 text-center">※ 入力した情報はサーバーに送信されません</p>
              </div>

              <button
                id="oracle-submit-btn"
                type="submit"
                disabled={!input.trim()}
                className="
                  w-full py-5 rounded-2xl font-bold text-lg tracking-wider
                  transition-all duration-500 relative overflow-hidden
                  disabled:opacity-40 disabled:cursor-not-allowed
                  bg-gradient-to-r from-amber-700/80 via-amber-500/90 to-amber-700/80
                  text-amber-100 border border-amber-400/40
                  enabled:shadow-[0_0_30px_rgba(201,168,76,0.4)]
                  enabled:hover:scale-[1.02] enabled:hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]
                  enabled:active:scale-[0.98]
                "
              >
                🌟 縁起物を呼び出す 🌟
              </button>
            </form>

            {/* 縁起物プレビュー */}
            <div className="mt-12 grid grid-cols-4 gap-3">
              {omensData.slice(0, 8).map(o => (
                <div key={o.id} className="flex flex-col items-center gap-1 opacity-40">
                  <span className="text-2xl">{o.emoji}</span>
                  <span className="text-[9px] text-purple-300/60 text-center leading-tight">{o.nameJa}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-purple-400/30 mt-3">12種の縁起物があなたを待っています</p>
          </div>
        )}

        {/* ─── STEP: 演出中 ─── */}
        {step === 'drawing' && (
          <div className="mt-16 text-center oracle-enter">
            <div className="relative inline-block">
              {/* 光のリング */}
              <div className="w-32 h-32 rounded-full border-2 border-amber-400/60 dragon-glow mx-auto flex items-center justify-center mb-8">
                <div className="w-20 h-20 rounded-full border border-amber-400/40 flex items-center justify-center">
                  <span className="text-4xl animate-pulse">✦</span>
                </div>
              </div>
            </div>
            <p className="text-amber-300/80 text-sm tracking-widest mb-2">縁起物を選定中…</p>
            <p className="text-purple-300/50 text-xs tracking-wider">あなたにふさわしい守護を呼び出しています</p>
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP: 結果 ─── */}
        {step === 'result' && omen && (
          <div ref={resultRef} className="mt-8 space-y-6 relative">

            {/* 縁起物カード */}
            <div className={`text-center transition-all duration-500 ${revealed ? 'oracle-enter' : 'opacity-0'}`}>
              <p className="text-xs tracking-[0.4em] text-amber-400/60 mb-4 uppercase">Today&apos;s Sacred Omen</p>

              <div className={`
                relative inline-flex flex-col items-center justify-center
                w-48 h-64 rounded-3xl border-2
                bg-gradient-to-b from-purple-900 via-purple-950 to-black/80
                backdrop-blur-sm cursor-default select-none
                ${revealed ? 'omen-reveal dragon-glow' : 'opacity-0'}
              `} style={{ borderColor: omen.color + '80' }}>
                {/* 背景光 */}
                <div className="absolute inset-0 rounded-3xl opacity-20" style={{ background: `radial-gradient(circle at 50% 40%, ${omen.color}, transparent 70%)` }} />

                <span className="text-7xl mb-3 relative z-10 float-animation">{omen.emoji}</span>
                <p className="text-xl font-bold relative z-10" style={{ color: omen.color }}>{omen.nameJa}</p>
                <p className="text-xs text-purple-300/60 mt-1 relative z-10">{omen.attribute}</p>

                {/* 四隅の装飾 */}
                {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                  <span key={i} className={`absolute ${pos} text-xs opacity-40`} style={{ color: omen.color }}>✦</span>
                ))}
              </div>

              <p className="text-amber-300/70 text-xs mt-3 tracking-widest">{omen.element} の加護</p>
            </div>

            {/* メッセージ本文 */}
            <div className={`rounded-2xl border border-amber-400/20 bg-gradient-to-b from-purple-950/80 to-black/60 p-6 backdrop-blur-sm transition-all duration-700 delay-300 ${revealed ? 'oracle-enter opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: omen.color }} className="text-lg">{omen.emoji}</span>
                <h2 className="text-sm tracking-widest text-amber-400/80 uppercase">{omen.nameJa}からのメッセージ</h2>
              </div>
              <p className="text-purple-100/90 text-sm leading-[2] whitespace-pre-line">{message}</p>
            </div>

            {/* 行動アドバイス */}
            <div className={`rounded-2xl border border-purple-500/20 bg-purple-950/40 p-5 transition-all duration-700 delay-500 ${revealed ? 'oracle-enter opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-400">✦</span>
                <h3 className="text-xs tracking-widest text-amber-400/70 uppercase">今日の開運アドバイス</h3>
              </div>
              <p className="text-purple-100/90 text-sm leading-relaxed">{omen.advice}</p>
            </div>

            {/* ─── LINE CTA（U1: 収益導線）─── */}
            <div className={`rounded-2xl bg-gradient-to-r from-green-900/40 via-green-700/20 to-green-900/40 border border-green-500/40 p-6 text-center transition-all duration-700 delay-700 ${revealed ? 'oracle-enter opacity-100' : 'opacity-0'}`}>
              <p className="text-green-300/80 text-xs tracking-widest mb-1 uppercase">Daily Oracle</p>
              <h3 className="text-green-100 text-base font-bold mb-2">
                この{omen.nameJa}からの毎朝のメッセージを受け取る
              </h3>
              <p className="text-green-200/60 text-xs mb-4 leading-relaxed">
                LINEに登録するだけ。毎朝あなたの守護メッセージが届きます。
              </p>
              <a
                id="line-cta-btn"
                href={LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('line_cta')}
                className="
                  inline-flex items-center gap-2 px-8 py-3.5 rounded-full
                  bg-[#06C755] text-white text-sm font-bold
                  hover:bg-[#05b34a] hover:scale-105
                  transition-all duration-300 line-pulse
                  shadow-[0_4px_20px_rgba(6,199,85,0.4)]
                "
              >
                <svg viewBox="0 0 40 40" width="18" height="18" fill="white">
                  <path d="M20 4C11.16 4 4 10.28 4 18c0 5.25 3.12 9.83 7.8 12.42-.33 1.17-.84 2.97-.97 3.43-.15.55.2.54.43.4.19-.12 2.39-1.58 3.36-2.23.97.14 1.96.21 2.98.21 8.84 0 16-6.28 16-14S28.84 4 20 4z"/>
                </svg>
                無料でLINE登録する
              </a>
            </div>

            {/* ─── ヴェルニCTA（Exit1）─── */}
            <div className={`rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 text-center transition-all duration-700 delay-900 ${revealed ? 'oracle-enter opacity-100' : 'opacity-0'}`}>
              <p className="text-amber-300/60 text-xs mb-2">
                ✦ もっと詳しく本格鑑定を受けたい方へ
              </p>
              <a
                id="vernier-cta-btn"
                href={VERNIER_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('vernier_cta')}
                className="text-amber-400/70 text-xs hover:text-amber-300 underline underline-offset-2 transition-colors"
              >
                → プロの占い師による本格鑑定はこちら（初回無料あり）
              </a>
            </div>

            {/* シェアボタン群（U2） */}
            <div className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-[1100ms] ${revealed ? 'oracle-enter opacity-100' : 'opacity-0'}`}>
              {/* Xシェア */}
              <button
                id="x-share-btn"
                onClick={() => {
                  trackClick('x_share')
                  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`
                  window.open(url, '_blank', 'noopener,noreferrer,width=550,height=420')
                }}
                className="
                  flex-1 py-4 rounded-2xl
                  bg-gradient-to-r from-slate-800 to-slate-700
                  border border-slate-600/50
                  text-slate-200 text-sm tracking-wider font-bold
                  hover:from-slate-700 hover:to-slate-600
                  hover:shadow-[0_0_20px_rgba(100,120,180,0.3)]
                  transition-all duration-300 flex items-center justify-center gap-2
                "
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Xでシェアして広める
              </button>

              {/* LINEシェア */}
              <button
                id="line-share-btn"
                onClick={() => {
                  trackClick('line_share')
                  const text = `${omen.nameJa}が降臨✨ 開運オラクルで今日のメッセージを受け取って👉 ${shareUrl}`
                  window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
                }}
                className="
                  flex-1 py-4 rounded-2xl
                  bg-[#06C755]/20 border border-[#06C755]/40
                  text-green-300 text-sm tracking-wider font-bold
                  hover:bg-[#06C755]/30
                  transition-all duration-300 flex items-center justify-center gap-2
                "
              >
                <svg viewBox="0 0 40 40" width="16" height="16" fill="currentColor">
                  <path d="M20 4C11.16 4 4 10.28 4 18c0 5.25 3.12 9.83 7.8 12.42-.33 1.17-.84 2.97-.97 3.43-.15.55.2.54.43.4.19-.12 2.39-1.58 3.36-2.23.97.14 1.96.21 2.98.21 8.84 0 16-6.28 16-14S28.84 4 20 4z"/>
                </svg>
                LINEで友達に送る
              </button>

              {/* もう一度 */}
              <button
                id="reset-btn"
                onClick={handleReset}
                className="
                  py-4 px-6 rounded-2xl border border-purple-500/30
                  text-purple-300/70 text-sm tracking-wider
                  hover:border-purple-400/50 hover:text-purple-200
                  transition-all duration-300
                "
              >
                もう一度
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="relative z-10 text-center py-6 text-purple-400/50 text-xs">
        <p>© 2026 開運オラクル — スピリチュアルメッセージはエンターテインメントです</p>
      </footer>
    </main>
  )
}
