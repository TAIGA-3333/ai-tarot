'use client'

/**
 * クライアント側のクリック計測ヘルパー。
 * 送信失敗（Supabase障害・ネットワークエラー等）は必ず握りつぶし、
 * ユーザーの操作フローを一切ブロックしない。
 */

const SRC_KEY = 'oracle_src'
const MAX_SRC_LEN = 50

// URLの?src=を捕捉してセッション内に保持する（?src=が無ければ既存の保存値を返す）
export function captureSrcFromUrl(): string | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const src = params.get('src')

  if (src) {
    const clipped = src.trim().slice(0, MAX_SRC_LEN)
    try {
      sessionStorage.setItem(SRC_KEY, clipped)
    } catch {
      // sessionStorageが使えない環境でも計測を諦めるだけでUXは壊さない
    }
    return clipped
  }

  try {
    return sessionStorage.getItem(SRC_KEY)
  } catch {
    return null
  }
}

export function trackEvent(event: string, meta: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return

  try {
    const src = captureSrcFromUrl()
    const payload = JSON.stringify({ event, src, meta, path: window.location.pathname })

    // ページ離脱時でも送信されやすいsendBeaconを優先
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      const sent = navigator.sendBeacon('/api/track', blob)
      if (sent) return
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // 計測失敗を握りつぶす
    })
  } catch {
    // JSON化失敗等も含め、計測は「できたらやる」程度の優先度に留める
  }
}
