import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const card = req.nextUrl.searchParams.get('card') || '月の導き'
  const color = req.nextUrl.searchParams.get('color') || 'ラベンダー'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #12051f 0%, #2a123d 55%, #17121f 100%)',
          color: '#f6e7b2',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 8, color: '#c9a84c' }}>月詠タロット</div>
        <div style={{ marginTop: 48, fontSize: 74, fontWeight: 800 }}>今日のカード</div>
        <div style={{ marginTop: 24, fontSize: 58 }}>{card}</div>
        <div style={{ marginTop: 48, fontSize: 34, color: '#d8c7ff' }}>ラッキーカラー: {color}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
