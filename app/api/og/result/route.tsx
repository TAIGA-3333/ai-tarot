import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import omensData from '@/lib/omens.json'
import { readFile } from 'fs/promises'
import path from 'path'

// Edge RuntimeはVercel Hobbyプランのバンドルサイズ上限(1MB)に収まらないため
// Node.js runtimeで実行する（@vercel/ogはNode runtimeでも動作する）。
export const runtime = 'nodejs'

// U1: @vercel/og はデフォルトだと日本語グリフを描画するために Google Fonts へ
// 実行時に動的フェッチする（fonts.gstatic.com 等）。本番Vercel edgeでは疎通するが、
// 閉域/オフライン環境では "Failed to load dynamic font" で画像生成ごと失敗する。
// そのため使用文字を含むサブセットフォントをリポジトリに同梱し、ローカル読込に切り替える
// （satoriの自動フォント探索を無効化し、常に決定的にレンダリングされるようにする）。
// Node.js runtimeではfetch(new URL(...))によるローカルファイル読込が使えないためfsを使う。
const fontRegular = readFile(path.join(process.cwd(), 'assets/fonts/NotoSansJP-Regular.ttf'))
const fontBold = readFile(path.join(process.cwd(), 'assets/fonts/NotoSansJP-Bold.ttf'))

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const omenId = searchParams.get('omen')
    const msg = searchParams.get('msg') || '今日あなたに必要なスピリチュアルメッセージ'

    const omen = omensData.find((o) => o.id === omenId) || omensData[0]
    const [regularData, boldData] = await Promise.all([fontRegular, fontBold])

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a1a',
            backgroundImage: `radial-gradient(circle at 50% 50%, ${omen.color}40 0%, #0a0a1a 70%)`,
            border: `8px solid ${omen.color}80`,
            fontFamily: 'Noto Sans JP',
          }}
        >
          {/* 上部装飾（絵文字・記号グリフはローカルフォントに未収録のため装飾線で代用） */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '40px',
            }}
          >
            <span style={{ fontSize: '24px', color: '#c9a84c', letterSpacing: '8px' }}>
              SPIRITUAL ORACLE
            </span>
          </div>

          {/* メイン: 縁起物バッジと名前
              ※ 🐉🐱🦅 等の実emojiグリフは @vercel/og のフォント同梱では描画できないため、
              代わりに縁起物カラーの円バッジ＋名前の頭文字でデザイン的に表現する。 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '40px',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                marginBottom: '30px',
                backgroundColor: `${omen.color}25`,
                border: `4px solid ${omen.color}`,
              }}
            >
              <span style={{ fontSize: '72px', fontWeight: 'bold', color: omen.color }}>
                {omen.nameJa.slice(0, 1)}
              </span>
            </div>
            <span style={{ fontSize: '64px', fontWeight: 'bold', color: omen.color, marginBottom: '20px' }}>
              {omen.nameJa}があなたを選びました
            </span>
            <span style={{ fontSize: '36px', color: '#e8e0d0', maxWidth: '900px', textAlign: 'center', lineHeight: 1.4 }}>
              「{msg}」
            </span>
          </div>

          {/* 下部CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 40px',
              backgroundColor: `${omen.color}20`,
              borderRadius: '40px',
              marginBottom: '60px',
              marginTop: '40px',
            }}
          >
            <span style={{ fontSize: '32px', color: '#fff', fontWeight: 'bold' }}>
              あなたの開運メッセージを受け取る
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Noto Sans JP', data: regularData, weight: 400, style: 'normal' },
          { name: 'Noto Sans JP', data: boldData, weight: 700, style: 'normal' },
        ],
      }
    )
  } catch (e: any) {
    console.error('OG Image generation error:', e)
    return new Response('Failed to generate OG Image', { status: 500 })
  }
}
