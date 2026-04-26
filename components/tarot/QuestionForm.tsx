'use client'

import { useState } from 'react'
import { Theme } from '@/types'

const THEMES: Theme[] = ['恋愛', '仕事', '人間関係', '金運', '健康', '総合']

const THEME_ICONS: Record<Theme, string> = {
  恋愛: '♥',
  仕事: '✦',
  人間関係: '◈',
  金運: '◉',
  健康: '✿',
  総合: '✵',
}

interface Props {
  onSubmit: (question: string, theme: Theme) => void
}

export default function QuestionForm({ onSubmit }: Props) {
  const [question, setQuestion] = useState('')
  const [theme, setTheme] = useState<Theme>('総合')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim().length < 5 || isLoading) return
    setIsLoading(true)
    await onSubmit(question, theme)
    setIsLoading(false)
  }

  return (
    <div className="mt-8">
      {/* 導入テキスト */}
      <div className="text-center mb-10">
        <div className="inline-block px-6 py-2 rounded-full border border-amber-400/30 bg-amber-400/5 mb-4">
          <span className="text-amber-300/80 text-sm tracking-wider">✦ 宇宙があなたの問いに答えます ✦</span>
        </div>
        <p className="text-purple-200/70 text-sm leading-relaxed">
          心に浮かんだ悩みや質問を、そのまま言葉にしてください。<br />
          月詠があなたのためにカードを選び、運命の道筋を照らします。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* テーマ選択 */}
        <div>
          <label className="block text-xs tracking-widest text-amber-400/70 mb-3 uppercase">テーマを選ぶ</label>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`
                  py-3 px-2 rounded-xl border text-sm transition-all duration-300 flex items-center justify-center gap-1.5
                  ${theme === t
                    ? 'border-amber-400/60 bg-amber-400/15 text-amber-300 shadow-[0_0_20px_rgba(201,168,76,0.3)]'
                    : 'border-purple-500/20 bg-purple-900/20 text-purple-300/60 hover:border-purple-400/40 hover:text-purple-200/80'
                  }
                `}
              >
                <span>{THEME_ICONS[t]}</span>
                <span>{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 質問入力 */}
        <div>
          <label className="block text-xs tracking-widest text-amber-400/70 mb-3 uppercase">あなたの問い</label>
          <div className="relative">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="例：彼との関係はこれからどうなるのでしょうか？&#10;例：今の仕事を続けるべきか、転職すべきか迷っています。"
              rows={4}
              className="
                w-full rounded-2xl border border-purple-500/30 bg-purple-950/40
                text-purple-100 placeholder-purple-400/40
                px-5 py-4 text-sm leading-relaxed resize-none
                focus:outline-none focus:border-amber-400/50 focus:bg-purple-950/60
                transition-all duration-300
                backdrop-blur-sm
              "
            />
            <div className="absolute bottom-3 right-4 text-xs text-purple-400/40">
              {question.length} 文字
            </div>
          </div>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={question.trim().length < 5 || isLoading}
          className="
            w-full py-5 rounded-2xl font-bold text-lg tracking-wider
            transition-all duration-500 relative overflow-hidden
            disabled:opacity-40 disabled:cursor-not-allowed
            enabled:hover:scale-[1.02] enabled:active:scale-[0.98]
            bg-gradient-to-r from-amber-700/80 via-amber-500/90 to-amber-700/80
            text-amber-100 border border-amber-400/40
            enabled:shadow-[0_0_30px_rgba(201,168,76,0.4)]
            enabled:hover:shadow-[0_0_50px_rgba(201,168,76,0.6)]
          "
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-2 border-amber-300/40 border-t-amber-300 rounded-full animate-spin" />
              カードを選んでいます...
            </span>
          ) : (
            <span>✦ タロットカードを引く ✦</span>
          )}
        </button>
      </form>

      {/* 区切り */}
      <div className="mt-12 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <span className="text-purple-400/40 text-xs">◈</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>

      {/* 有料プランの案内（簡易） */}
      <div className="mt-6 text-center">
        <p className="text-purple-400/50 text-xs">
          無料プラン：1日1回 ／
          <a href="/upgrade" className="text-amber-400/70 hover:text-amber-300 ml-1 transition-colors">
            ✦ 月額490円で無制限に
          </a>
        </p>
      </div>
    </div>
  )
}
