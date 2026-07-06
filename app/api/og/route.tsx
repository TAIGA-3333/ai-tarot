import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { loadNotoSansJP } from '@/lib/og-font'
import { parseShareSummary } from '@/lib/share'

export const runtime = 'edge'

const APP_TITLE = '月詠タロット'

// 装飾用の「星」はUnicode記号(☽✦◈等)を使わずCSSの円のみで表現する。
// satoriのデフォルトフォントにこれらの記号のグリフが無く文字化けした
// 前回セッションの反省を踏まえた設計。
const STAR_POSITIONS = [
  { top: 40, left: 90, size: 4, opacity: 0.85 },
  { top: 70, left: 1080, size: 3, opacity: 0.6 },
  { top: 540, left: 140, size: 3, opacity: 0.5 },
  { top: 500, left: 1020, size: 5, opacity: 0.7 },
  { top: 160, left: 620, size: 3, opacity: 0.4 },
  { top: 420, left: 60, size: 3, opacity: 0.45 },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const summary = parseShareSummary(searchParams)

  const theme = summary?.theme ?? '総合'
  const cardNames = summary && summary.cardNames.length > 0 ? summary.cardNames : ['月詠のカード']
  const luckyColor = summary?.luckyColor ?? ''

  const allText = [APP_TITLE, theme, luckyColor, ...cardNames, '私も占ってもらう', 'の導き', 'ラッキーカラー'].join(
    ''
  )
  const fontData = await loadNotoSansJP(allText, 700)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a1a',
          backgroundImage:
            'radial-gradient(circle at 18% 25%, rgba(120,70,200,0.35) 0%, rgba(10,10,26,0) 45%), radial-gradient(circle at 82% 78%, rgba(201,168,76,0.22) 0%, rgba(10,10,26,0) 45%)',
          position: 'relative',
          // fontDataが無い場合はキー自体を省略し、satoriのデフォルトフォントに委ねる
          // （undefinedを明示すると satori 側の fontFamily.split() でクラッシュするため）
          ...(fontData ? { fontFamily: 'Noto Sans JP' } : {}),
        }}
      >
        {STAR_POSITIONS.map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              width: pos.size,
              height: pos.size,
              borderRadius: 999,
              backgroundColor: '#f0d080',
              opacity: pos.opacity,
              display: 'flex',
            }}
          />
        ))}

        <div style={{ display: 'flex', fontSize: 22, letterSpacing: 8, color: '#c9a84c', marginBottom: 20 }}>
          {APP_TITLE}
        </div>

        <div style={{ display: 'flex', gap: 24, marginBottom: 30 }}>
          {cardNames.slice(0, 3).map((name, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 160,
                height: 210,
                borderRadius: 20,
                border: '2px solid rgba(201,168,76,0.5)',
                backgroundColor: 'rgba(45,27,78,0.55)',
                padding: 16,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #f0d080, #c9a84c)',
                  marginTop: 8,
                  marginBottom: 18,
                  display: 'flex',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  fontSize: 22,
                  color: '#f0d080',
                  textAlign: 'center',
                  fontWeight: 700,
                }}
              >
                {name}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#e8e0d0', marginBottom: 10 }}>
          【{theme}】の導き
        </div>

        {luckyColor && (
          <div style={{ display: 'flex', fontSize: 18, color: 'rgba(232,224,208,0.7)' }}>
            ラッキーカラー: {luckyColor}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            marginTop: 34,
            padding: '14px 32px',
            borderRadius: 999,
            backgroundColor: 'rgba(201,168,76,0.15)',
            border: '1px solid rgba(201,168,76,0.5)',
            color: '#f0d080',
            fontSize: 20,
          }}
        >
          私も占ってもらう
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData ? [{ name: 'Noto Sans JP', data: fontData, weight: 700, style: 'normal' }] : undefined,
    }
  )
}
