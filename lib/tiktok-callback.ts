// TikTok OAuthコールバック処理の共通ロジック。
//
// 背景: TikTok Developer Consoleの審査提出フォームがデモ動画欄未入力だと保存できない仕様のため、
// オーナーがRedirect URIを正式なパス(/api/tiktok/callback)に変更できない状態になっている。
// コンソール側には現在ルートパス(https://kaiun-oracle.vercel.app/)が登録済みで動かせないため、
// アプリ側をこの既存登録値に合わせている。
//
// このため、コールバック本体のロジックをここに切り出し、
// - app/api/tiktok/callback/route.ts (審査通過後、Redirect URIを正式なパスへ戻す時のために保持)
// - app/page.tsx (現在の実際のコールバック受け口。ルートパスでcodeパラメータを検知する)
// の両方から呼べるようにしている。
//
// 重要: アクセストークン・クライアントシークレットは一切ログに出力・画面表示しない。

export const TIKTOK_REDIRECT_URI = 'https://kaiun-oracle.vercel.app/'

const DEMO_VIDEO_URL = 'https://kaiun-oracle.vercel.app/demo/tiktok-demo-video.mp4'

export interface TikTokCallbackParams {
  code: string | null
  returnedState: string | null
  tiktokError: string | null
  tiktokErrorDescription: string | null
  cookieState: string | undefined
}

export interface TikTokCallbackResult {
  title: string
  bodyHtml: string
  isError: boolean
}

export async function resolveTikTokCallback(params: TikTokCallbackParams): Promise<TikTokCallbackResult> {
  const { code, returnedState, tiktokError, tiktokErrorDescription, cookieState } = params

  // TikTok側が認可を拒否/失敗した場合
  if (tiktokError) {
    return {
      title: '連携に失敗しました',
      bodyHtml: `<p>TikTok側で認可が拒否またはエラーになりました。</p>
       <p>エラー内容: <code>${tiktokError}</code></p>
       ${tiktokErrorDescription ? `<p>${tiktokErrorDescription}</p>` : ''}`,
      isError: true,
    }
  }

  if (!code || !returnedState) {
    return {
      title: '連携に失敗しました',
      bodyHtml: `<p>認可コード(code)またはstate値が受け取れませんでした。</p>
       <p>ステップ: 認可コールバックの受信</p>`,
      isError: true,
    }
  }

  // CSRF対策: cookieに保存したstateと一致するか検証
  if (!cookieState || cookieState !== returnedState) {
    return {
      title: '連携に失敗しました',
      bodyHtml: `<p>state値が一致しませんでした（CSRF対策による拒否）。</p>
       <p>ステップ: state検証</p>
       <p>お手数ですが最初からやり直してください。</p>`,
      isError: true,
    }
  }

  // Vercel環境変数のコピペミス(先頭・末尾の空白や改行混入)を吸収するため必ずtrimする
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim()
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim()

  if (!clientKey || !clientSecret) {
    return {
      title: '連携に失敗しました',
      bodyHtml: `<p>サーバー側の環境変数(TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET)が設定されていません。</p>
       <p>ステップ: 事前設定確認</p>`,
      isError: true,
    }
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
        redirect_uri: TIKTOK_REDIRECT_URI,
      }).toString(),
    })

    const tokenJson = await tokenRes.json()

    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error('[tiktok-callback] トークン交換に失敗しました (詳細はレスポンスコードのみログ)', tokenRes.status)
      return {
        title: '連携に失敗しました',
        bodyHtml: `<p>ステップ: トークン交換 で失敗しました。</p>
         <p>HTTPステータス: <code>${tokenRes.status}</code></p>
         <p>エラー内容: <code>${tokenJson.error ?? 'unknown'}</code> ${tokenJson.error_description ?? ''}</p>`,
        isError: true,
      }
    }

    accessToken = tokenJson.access_token
  } catch (e) {
    console.error('[tiktok-callback] トークン交換で例外が発生しました', e instanceof Error ? e.message : e)
    return {
      title: '連携に失敗しました',
      bodyHtml: `<p>ステップ: トークン交換 で例外が発生しました。</p>
       <p>${e instanceof Error ? e.message : '不明なエラー'}</p>`,
      isError: true,
    }
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
      return {
        title: '連携に失敗しました',
        bodyHtml: `<p>ステップ: ユーザー情報取得 で失敗しました。</p>
         <p>HTTPステータス: <code>${userRes.status}</code></p>
         <p>エラー内容: <code>${userJson.error?.message ?? 'unknown'}</code></p>`,
        isError: true,
      }
    }

    displayName = userJson.data?.user?.display_name ?? '(表示名なし)'
  } catch (e) {
    console.error('[tiktok-callback] ユーザー情報取得で例外が発生しました', e instanceof Error ? e.message : e)
    return {
      title: '連携に失敗しました',
      bodyHtml: `<p>ステップ: ユーザー情報取得 で例外が発生しました。</p>
       <p>${e instanceof Error ? e.message : '不明なエラー'}</p>`,
      isError: true,
    }
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
      return {
        title: '連携は成功・投稿開始に失敗しました',
        bodyHtml: `<p>${displayName} として接続しました。</p>
         <p>ステップ: 動画投稿(Direct Post)開始 で失敗しました。</p>
         <p>HTTPステータス: <code>${publishRes.status}</code></p>
         <p>エラー内容: <code>${publishJson.error?.message ?? 'unknown'}</code></p>`,
        isError: true,
      }
    }

    publishId = publishJson.data?.publish_id ?? '(publish_idなし)'
  } catch (e) {
    console.error('[tiktok-callback] 動画投稿の開始で例外が発生しました', e instanceof Error ? e.message : e)
    return {
      title: '連携は成功・投稿開始に失敗しました',
      bodyHtml: `<p>${displayName} として接続しました。</p>
       <p>ステップ: 動画投稿(Direct Post)開始 で例外が発生しました。</p>
       <p>${e instanceof Error ? e.message : '不明なエラー'}</p>`,
      isError: true,
    }
  }

  return {
    title: '連携に成功しました',
    bodyHtml: `<p>${displayName} として接続しました。</p>
     <p>投稿ID: <code>${publishId}</code></p>
     <p class="label">この投稿は公開範囲「自分のみ」で送信されています</p>`,
    isError: false,
  }
}

// カード表示用HTMLフラグメント(スタイル込み、<html>/<head>/<body>は含まない)。
// - Route Handler側(app/api/tiktok/callback/route.ts)ではこれを完全なHTML文書に包んで返す。
// - Server Component側(app/page.tsx)ではlayout.tsxが既に<html>/<body>を提供しているため、
//   このフラグメントをそのままdangerouslySetInnerHTMLで描画する。
export function renderTikTokResultFragment(title: string, bodyHtml: string, isError: boolean): string {
  return `<style>
  .tiktok-result-wrap {
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
  .tiktok-result-wrap .card {
    max-width: 480px;
    width: 100%;
    background: rgba(40, 20, 70, 0.6);
    border: 1px solid ${isError ? 'rgba(240,100,100,0.4)' : 'rgba(201,168,76,0.35)'};
    border-radius: 20px;
    padding: 32px 28px;
    text-align: center;
    backdrop-filter: blur(6px);
  }
  .tiktok-result-wrap h1 { font-size: 20px; margin: 0 0 16px; color: ${isError ? '#ff9d9d' : '#f0d789'}; }
  .tiktok-result-wrap p { font-size: 14px; line-height: 1.8; margin: 8px 0; word-break: break-word; }
  .tiktok-result-wrap .label { font-size: 11px; letter-spacing: 0.15em; color: #b39ddb; text-transform: uppercase; margin-top: 20px; }
  .tiktok-result-wrap code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 6px; font-size: 12px; }
  .tiktok-result-wrap a { color: #f0d789; }
</style>
<div class="tiktok-result-wrap">
  <div class="card">
    <h1>${title}</h1>
    ${bodyHtml}
    <p class="label"><a href="/tiktok-connect">連携ページに戻る</a></p>
  </div>
</div>`
}
