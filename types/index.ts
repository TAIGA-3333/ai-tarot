export type Theme = '恋愛' | '仕事' | '人間関係' | '金運' | '健康' | '総合'

export interface TarotCard {
  id: number
  name: string
  nameJa: string
  arcana: 'major' | 'minor'
  suit?: string
  upright: string
  reversed: string
  imageKeyword: string
}

export interface DrawnCard {
  card: TarotCard
  isReversed: boolean
  position: string
}

export interface TarotReading {
  id?: string
  userId?: string
  question: string
  theme: Theme
  drawnCards: DrawnCard[]
  interpretation: string
  luckyColor: string
  actionAdvice: string
  imagePrompt: string
  createdAt?: string
}

export interface UserProfile {
  id: string
  email: string
  isPremium: boolean
  dailyCount: number
  lastReadDate: string | null
  stripeCustomerId?: string
}
