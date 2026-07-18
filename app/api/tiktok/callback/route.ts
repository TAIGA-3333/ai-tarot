import { NextRequest, NextResponse } from 'next/server'
import { resolveTikTokCallback, renderTikTokResultFragment } from '@/lib/tiktok-callback'

// TikTok Developer審査用デモ: OAuthコールバックエンドポイント。
//
// 注意: TikTok Developer Console側の審査提出フォームの制約により、Redirect URIは
// 現在アプリのルートパス(https://kaiun-oracle.vercel.app/)に登録されたままになっている
// (デモ動画欄が未入力だと保存できない仕様のため、コンソール側を正式なパスへ変更できない)。
// そのため、実際のコールバックは現在 app/page.tsx が受けている。
// このエンドポイントは審査通過後にRedirect URIを正式なこのパスへ戻す時のために残してある。
// ロジック本体は lib/tiktok-callback.ts に共通化されており、app/page.tsx と共有している。

function renderPage(title: string, bodyHtml: string, isError: boolean): NextResponse {
  const fragment = renderTikTokResultFragment(title, bodyHtml, isError)
  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
</head>
<body>
${fragment}
</body>
</html>`

  return new NextResponse(html, {
    status: isError ? 400 : 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const returnedState = searchParams.get('state')
  const tiktokError = searchParams.get('error')
  const tiktokErrorDescription = searchParams.get('error_description')
  const cookieState = req.cookies.get('tiktok_oauth_state')?.value

  const { title, bodyHtml, isError } = await resolveTikTokCallback({
    code,
    returnedState,
    tiktokError,
    tiktokErrorDescription,
    cookieState,
  })

  const response = renderPage(title, bodyHtml, isError)

  // state cookieは使い終わったので破棄
  response.cookies.set('tiktok_oauth_state', '', { maxAge: 0, path: '/' })

  return response
}
