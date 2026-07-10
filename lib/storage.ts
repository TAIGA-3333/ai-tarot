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
  const saved = { ...reading, id: reading.id || crypto.randomUUID(), createdAt: reading.createdAt || new Date().toISOString() }
  localStorage.setItem(KEYS.READINGS, JSON.stringify([saved, ...all].slice(0, 50)))
  return saved
}

export async function syncReadingToServer(reading: TarotReading, clientSessionId: string) {
  try {
    await fetch('/api/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSessionId, reading }),
    })
  } catch (e) {
    console.error('Failed to sync reading to server:', e)
  }
}

export async function fetchReadingsFromServer(clientSessionId: string): Promise<TarotReading[]> {
  try {
    const res = await fetch(`/api/readings?client_session_id=${clientSessionId}`)
    const data = await res.json()
    if (data.readings) {
      // ローカルとマージして保存
      localStorage.setItem(KEYS.READINGS, JSON.stringify(data.readings))
      return data.readings
    }
  } catch (e) {
    console.error('Failed to fetch readings from server:', e)
  }
  return getReadings()
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
