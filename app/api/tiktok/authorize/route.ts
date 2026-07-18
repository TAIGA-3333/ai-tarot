import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { TIKTOK_REDIRECT_URI } from '@/lib/tiktok-callback'

// TikTok Developer審査用デモ: OAuth認可フローの開始エンドポイント。
// ランダムなstate値を発行してhttpOnly cookieに保存し(CSRF対策)、
// TikTokの認可画面へリダイレクトする。
//
// 注意: TikTok Developer Console側の審査提出フォームの制約により、
// Redirect URIは現在アプリのルートパス(https://kaiun-oracle.vercel.app/)に
// 登録されたままになっている(コンソール側を変更できない)。そのため、ここで送る
// redirect_uriもコンソールの登録値に合わせてルートパスにしている。
// 実際のコールバック処理は app/page.tsx が担う(lib/tiktok-callback.ts参照)。
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
  authorizeUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI)
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
