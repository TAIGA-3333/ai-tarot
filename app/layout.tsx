import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://kaiun-oracle.vercel.app'),
  title: '開運オラクル — 今日のスピリチュアルメッセージ',
  description: '龍神・招き猫・鳳凰…あなたを選んだ縁起物が、今日の開運メッセージを届けます。登録不要・15秒で結果。LINEで毎朝のご縁を受け取って。',
  keywords: ['開運', '今日の運勢', 'スピリチュアル', '龍神', '招き猫', '縁起物', '開運メッセージ', '無料占い', '金運', '恋愛運'],
  openGraph: {
    title: '開運オラクル — 龍神があなたを選びました',
    description: '今日あなたを選んだ縁起物が、スピリチュアルメッセージを届けます。登録不要・15秒。',
    type: 'website',
    images: ['/api/og/result'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '開運オラクル — 龍神があなたを選びました',
    description: '今日あなたを選んだ縁起物が、スピリチュアルメッセージを届けます。登録不要・15秒。',
    images: ['/api/og/result'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
