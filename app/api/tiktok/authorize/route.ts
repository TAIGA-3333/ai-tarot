import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// TikTok Developer審査用デモ: OAuth認可フローの開始エンドポイント。
// ランダムなstate値を発行してhttpOnly cookieに保存し(CSRF対策)、
// TikTokの認可画面へリダイレクトする。

const REDIRECT_URI = 'https://kaiun-oracle.vercel.app/api/tiktok/callback'
const SCOPES = 'user.info.basic,video.publish'

export async function GET() {
  // Vercel環境変数のコピペミス(先頭・末尾の空白や改行混入)を吸収するため必ずtrimする
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim()

  if (!clientKey) {
    return NextResponse.json(
      { error: 'TIKTOK_CLIENT_KEY が設定されていません（Vercel環境変数を確認してください）' },
      { status: 500 }
    )
  }

  const state = randomBytes(16).toString('hex')

  const authorizeUrl = new URL('https://www.tiktok.com/v2/auth/authorize/')
  authorizeUrl.searchParams.set('client_key', clientKey)
  authorizeUrl.searchParams.set('scope', SCOPES)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authorizeUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(authorizeUrl.toString(), 302)
  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10分
    path: '/',
  })

  return response
}
