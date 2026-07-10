'use client'

import { useState, useEffect } from 'react'
import { Theme, TarotReading } from '@/types'
import { canReadToday, incrementDaily, saveReading, getIsPremium, syncReadingToServer, fetchReadingsFromServer } from '@/lib/storage'
import { getClientSessionId } from '@/lib/clientSession'

type Step = 'input' | 'drawing' | 'result'

export function useTarot() {
  const [step, setStep] = useState<Step>('input')
  const [reading, setReading] = useState<TarotReading | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(() => getIsPremium())
  const [limitReached, setLimitReached] = useState(() => !canReadToday(getIsPremium()))

  useEffect(() => {
    let canceled = false
    const clientSessionId = getClientSessionId()

    const refreshData = async () => {
      try {
        // プレミアムステータス更新
        const res = await fetch(`/api/premium/status?client_session_id=${clientSessionId}`)
        const data = await res.json()
        if (!canceled && typeof data.isPremium === 'boolean') {
          setIsPremium(data.isPremium)
          setLimitReached(!canReadToday(data.isPremium))
        }
        
        // 履歴の同期
        await fetchReadingsFromServer(clientSessionId)
      } catch {
        // localStorage の状態で継続
      }
    }

    refreshData()
    return () => {
      canceled = true
    }
  }, [])

  const submit = async (question: string, theme: Theme) => {
    if (!canReadToday(isPremium)) {
      setLimitReached(true)
      return
    }

    const clientSessionId = getClientSessionId()
    setError(null)
    setStep('drawing')

    try {
      const res = await fetch('/api/tarot/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, theme, cardCount: 3 }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'エラーが発生しました')
        setStep('input')
        return
      }

      const fullReading: TarotReading = { question, theme, ...data }
      const saved = saveReading(fullReading)
      incrementDaily()

      // クラウド同期（バックグラウンド）
      syncReadingToServer(saved, clientSessionId).catch(() => {})

      fetch('/api/analytics/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSessionId,
          theme,
          cardCount: data.drawnCards?.length ?? 0,
        }),
      }).catch(() => {})

      setReading(saved)
      setTimeout(() => setStep('result'), 3000)
    } catch {
      setError('通信エラーが発生しました。再度お試しください。')
      setStep('input')
    }
  }

  const reset = () => {
    setReading(null)
    setError(null)
    const premium = isPremium || getIsPremium()
    setIsPremium(premium)
    setLimitReached(!canReadToday(premium))
    setStep('input')
  }

  return { step, reading, error, isPremium, limitReached, submit, reset }
}
