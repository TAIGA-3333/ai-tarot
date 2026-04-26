import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '月詠タロット — AIが導く、あなたの運命',
  description: 'AIタロット占いで、恋愛・仕事・人間関係の悩みに答えを。神秘の月詠占い師があなたの未来を照らします。',
  openGraph: {
    title: '月詠タロット — AIが導く、あなたの運命',
    description: 'AIタロット占いで、恋愛・仕事・人間関係の悩みに答えを。',
    type: 'website',
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
