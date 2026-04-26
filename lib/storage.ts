import { TarotReading } from '@/types'

const KEYS = {
  READINGS: 'tsukuyomi_readings',
  DAILY: 'tsukuyomi_daily',
  PREMIUM: 'tsukuyomi_premium',
} as const

// 今日の日付文字列（YYYY-MM-DD）
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// ---- 鑑定履歴 ----
export function saveReading(reading: TarotReading): TarotReading {
  const all = getReadings()
  const saved = { ...reading, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  localStorage.setItem(KEYS.READINGS, JSON.stringify([saved, ...all].slice(0, 50)))
  return saved
}

export function getReadings(): TarotReading[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEYS.READINGS) || '[]')
  } catch {
    return []
  }
}

// ---- 1日制限 ----
interface DailyState {
  date: string
  count: number
}

export function getDailyState(): DailyState {
  if (typeof window === 'undefined') return { date: today(), count: 0 }
  try {
    const raw = localStorage.getItem(KEYS.DAILY)
    if (!raw) return { date: today(), count: 0 }
    const state: DailyState = JSON.parse(raw)
    // 日付が変わっていたらリセット
    if (state.date !== today()) return { date: today(), count: 0 }
    return state
  } catch {
    return { date: today(), count: 0 }
  }
}

export function incrementDaily(): void {
  const state = getDailyState()
  localStorage.setItem(KEYS.DAILY, JSON.stringify({ date: today(), count: state.count + 1 }))
}

export function canReadToday(isPremium: boolean): boolean {
  if (isPremium) return true
  return getDailyState().count < 1
}

// ---- プレミアム（モック）----
export function getIsPremium(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEYS.PREMIUM) === 'true'
}

export function setIsPremium(v: boolean): void {
  localStorage.setItem(KEYS.PREMIUM, String(v))
}
