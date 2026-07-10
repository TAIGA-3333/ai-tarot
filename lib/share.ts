import { Theme } from '@/types'

/**
 * シェア結果カード（U1）用の共有サマリー。
 * 個人を特定しない最小限の情報のみをURLに載せ、DB（Supabase）に依存せず
 * URLだけで /api/og の画像生成・/s のOGP表示・新規セッション開始まで完結させる。
 */
export interface ShareSummary {
  theme: Theme
  cardNames: string[]
  luckyColor: string
}

const MAX_THEME_LEN = 10
const MAX_NAME_LEN = 20
const MAX_COLOR_LEN = 30
const MAX_CARDS = 3

function clip(value: string, max: number): string {
  return value.trim().slice(0, max)
}

export function buildShareParams(summary: ShareSummary, src: string = 'share'): URLSearchParams {
  const params = new URLSearchParams()
  params.set('theme', clip(summary.theme, MAX_THEME_LEN))
  params.set(
    'cards',
    summary.cardNames
      .slice(0, MAX_CARDS)
      .map(name => clip(name, MAX_NAME_LEN))
      .join(',')
  )
  params.set('color', clip(summary.luckyColor, MAX_COLOR_LEN))
  params.set('src', clip(src, 50))
  return params
}

export function buildShareUrl(origin: string, summary: ShareSummary, src: string = 'share'): string {
  const params = buildShareParams(summary, src)
  return `${origin.replace(/\/$/, '')}/s?${params.toString()}`
}

export function parseShareSummary(searchParams: URLSearchParams): ShareSummary | null {
  const theme = searchParams.get('theme')
  const cardsRaw = searchParams.get('cards')
  const color = searchParams.get('color')

  if (!theme || !cardsRaw) return null

  const cardNames = cardsRaw
    .split(',')
    .map(name => clip(name, MAX_NAME_LEN))
    .filter(Boolean)
    .slice(0, MAX_CARDS)

  if (cardNames.length === 0) return null

  return {
    theme: clip(theme, MAX_THEME_LEN) as Theme,
    cardNames,
    luckyColor: color ? clip(color, MAX_COLOR_LEN) : '',
  }
}
