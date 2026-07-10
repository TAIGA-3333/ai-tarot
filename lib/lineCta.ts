// U0: LINE @101ebuku への単一CTA導線＋クリック計測（共通ユーティリティ）
// app/page.tsx の既存実装と同じロジックを共有化し、fortune/history/upgrade など
// 追加のルートからも同じ計測仕様でCTAを設置できるようにする。
export const LINE_URL = 'https://line.me/R/ti/p/@101ebuku'

export function trackClick(label: string): void {
  fetch('/api/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      label,
      src: new URLSearchParams(window.location.search).get('src') ?? 'direct',
    }),
  }).catch(() => {})
}
