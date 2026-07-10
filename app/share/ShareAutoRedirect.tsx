'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * シェアされた結果ページを開いた人を、数秒後に自分の占い体験へ自動的に送る。
 * OGP（クローラー向けメタ情報）はサーバー側の generateMetadata が担当するため、
 * ここでのクライアント側リダイレクトはクローラーの結果カード表示を妨げない。
 */
export default function ShareAutoRedirect({ delayMs = 4000 }: { delayMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/?src=share')
    }, delayMs)
    return () => clearTimeout(timer)
  }, [router, delayMs])

  return null
}
