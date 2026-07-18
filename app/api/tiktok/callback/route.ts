import { NextRequest, NextResponse } from 'next/server'

// TikTok Developer審査用デモ: OAuthコールバックエンドポイント。
// 認可コードをアクセストークンに交換し、ユーザー情報取得→動画投稿(Direct Post)開始までの
// 一連のフローを実行し、結果を日本語の簡易HTMLページで表示する。
//
// 重要: アクセストークン・クライアントシークレットは一切ログに出力・画面表示しない。
// 表示するのは display_name と publish_id のみ。

const REDIRECT_URI = 'https://kaiun-oracle.vercel.app/api/tiktok/callback'
const DEMO_VIDEO_URL = 'https://kaiun-oracle.vercel.app/demo/tiktok-demo-video.mp4'

function renderPage(title: string, bodyHtml: string, isError: boolean): NextResponse {
  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #1a0b2e 0%, #0d0518 100%);
    color: #e9e0ff;
    font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif;
    padding: 24px;
    box-sizing: border-box;
  }
  .card {
    max-width: 480px;
    width: 100%;
    background: rgba(40, 20, 70, 0.6);
    border: 1px solid ${isError ? 'rgba(240,100,100,0.4)' : 'rgba(201,168,76,0.35)'};
    border-radius: 20px;
    padding: 32px 28px;
    text-align: center;
    backdrop-filter: blur(6px);
  }
  h1 { font-size: 20px; margin: 0 0 16px; color: ${isError ? '#ff9d9d' : '#f0d789'}; }
  p { font-size: 14px; line-height: 1.8; margin: 8px 0; word-break: break-word; }
  .label { font-size: 11px; letter-spacing: 0.15em; color: #b39ddb; text-transform: uppercase; margin-top: 20px; }
  code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 6px; font-size: 12px; }
  a { color: #f0d789; }
</style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    ${bodyHtml}
    <p class="label"><a href="/tiktok-connect">連携ページに戻る</a></p>
  </div>
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

  // TikTok側が認可を拒否/失敗した場合
  if (tiktokError) {
    return renderPage(
      '連携に失敗しました',
      `<p>TikTok側で認可が拒否またはエラーになりました。</p>
       <p>エラー内容: <code>${tiktokError}</code></p>
       ${tiktokErrorDescription ? `<p>${tiktokErrorDescription}</p>` : ''}`,
      true
    )
  }

  if (!code || !returnedState) {
    return renderPage(
      '連携に失敗しました',
      `<p>認可コード(code)またはstate値が受け取れませんでした。</p>
       <p>ステップ: 認可コールバックの受信</p>`,
      true
    )
  }

  // CSRF対策: cookieに保存したstateと一致するか検証
  if (!cookieState || cookieState !== returnedState) {
    return renderPage(
      '連携に失敗しました',
      `<p>state値が一致しませんでした（CSRF対策による拒否）。</p>
       <p>ステップ: state検証</p>
       <p>お手数ですが最初からやり直してください。</p>`,
      true
    )
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET

  if (!clientKey || !clientSecret) {
    return renderPage(
      '連携に失敗しました',
      `<p>サーバー側の環境変数(TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET)が設定されていません。</p>
       <p>ステップ: 事前設定確認</p>`,
      true
    )
  }

  // ── ステップ1: 認可コード → アクセストークン交換 ──
  let accessToken: string
  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }).toString(),
    })

    const tokenJson = await tokenRes.json()

    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error('[tiktok-callback] トークン交換に失敗しました (詳細はレスポンスコードのみログ)', tokenRes.status)
      return renderPage(
        '連携に失敗しました',
        `<p>ステップ: トークン交換 で失敗しました。</p>
         <p>HTTPステータス: <code>${tokenRes.status}</code></p>
         <p>エラー内容: <code>${tokenJson.error ?? 'unknown'}</code> ${tokenJson.error_description ?? ''}</p>`,
        true
      )
    }

    accessToken = tokenJson.access_token
  } catch (e) {
    console.error('[tiktok-callback] トークン交換で例外が発生しました', e instanceof Error ? e.message : e)
    return renderPage(
      '連携に失敗しました',
      `<p>ステップ: トークン交換 で例外が発生しました。</p>
       <p>${e instanceof Error ? e.message : '不明なエラー'}</p>`,
      true
    )
  }

  // ── ステップ2: ユーザー情報取得 ──
  let displayName = '(取得できませんでした)'
  try {
    const userRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    const userJson = await userRes.json()

    if (!userRes.ok || userJson.error?.code !== 'ok') {
      console.error('[tiktok-callback] ユーザー情報取得に失敗しました', userRes.status)
      return renderPage(
        '連携に失敗しました',
        `<p>ステップ: ユーザー情報取得 で失敗しました。</p>
         <p>HTTPステータス: <code>${userRes.status}</code></p>
         <p>エラー内容: <code>${userJson.error?.message ?? 'unknown'}</code></p>`,
        true
      )
    }

    displayName = userJson.data?.user?.display_name ?? '(表示名なし)'
  } catch (e) {
    console.error('[tiktok-callback] ユーザー情報取得で例外が発生しました', e instanceof Error ? e.message : e)
    return renderPage(
      '連携に失敗しました',
      `<p>ステップ: ユーザー情報取得 で例外が発生しました。</p>
       <p>${e instanceof Error ? e.message : '不明なエラー'}</p>`,
      true
    )
  }

  // ── ステップ3: 動画投稿(Direct Post / PULL_FROM_URL)開始 ──
  let publishId = '(取得できませんでした)'
  try {
    const publishRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          privacy_level: 'SELF_ONLY',
          title: '開運メッセージ配信テスト投稿',
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: DEMO_VIDEO_URL,
        },
      }),
    })
    const publishJson = await publishRes.json()

    if (!publishRes.ok || publishJson.error?.code !== 'ok') {
      console.error('[tiktok-callback] 動画投稿の開始に失敗しました', publishRes.status)
      return renderPage(
        '連携は成功・投稿開始に失敗しました',
        `<p>${displayName} として接続しました。</p>
         <p>ステップ: 動画投稿(Direct Post)開始 で失敗しました。</p>
         <p>HTTPステータス: <code>${publishRes.status}</code></p>
         <p>エラー内容: <code>${publishJson.error?.message ?? 'unknown'}</code></p>`,
        true
      )
    }

    publishId = publishJson.data?.publish_id ?? '(publish_idなし)'
  } catch (e) {
    console.error('[tiktok-callback] 動画投稿の開始で例外が発生しました', e instanceof Error ? e.message : e)
    return renderPage(
      '連携は成功・投稿開始に失敗しました',
      `<p>${displayName} として接続しました。</p>
       <p>ステップ: 動画投稿(Direct Post)開始 で例外が発生しました。</p>
       <p>${e instanceof Error ? e.message : '不明なエラー'}</p>`,
      true
    )
  }

  const response = renderPage(
    '連携に成功しました',
    `<p>${displayName} として接続しました。</p>
     <p>投稿ID: <code>${publishId}</code></p>
     <p class="label">この投稿は公開範囲「自分のみ」で送信されています</p>`,
    false
  )

  // state cookieは使い終わったので破棄
  response.cookies.set('tiktok_oauth_state', '', { maxAge: 0, path: '/' })

  return response
}
