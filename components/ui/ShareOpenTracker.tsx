'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/track'

interface Props {
  src: string
  theme?: string
}

// シェアURL(/s)が開かれたことをトラッキングするだけの非表示コンポーネント
export default function ShareOpenTracker({ src, theme }: Props) {
  useEffect(() => {
    trackEvent('share_open', theme ? { src, theme } : { src })
  }, [src, theme])

  return null
}
