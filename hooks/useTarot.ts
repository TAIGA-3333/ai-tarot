'use client'

import { useState, useEffect } from 'react'
import { Theme, TarotReading } from '@/types'
import { canReadToday, incrementDaily, saveReading, getIsPremium } from '@/lib/storage'

type Step = 'input' | 'drawing' | 'result'

export function useTarot() {
  const [step, setStep] = useState<Step>('input')
  const [reading, setReading] = useState<TarotReading | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  useEffect(() => {
    const premium = getIsPremium()
    setIsPremium(premium)
    setLimitReached(!canReadToday(premium))
  }, [])

  const submit = async (question: string, theme: Theme) => {
    if (!canReadToday(isPremium)) {
      setLimitReached(true)
      return
    }

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
    const premium = getIsPremium()
    setIsPremium(premium)
    setLimitReached(!canReadToday(premium))
    setStep('input')
  }

  return { step, reading, error, isPremium, limitReached, submit, reset }
}
