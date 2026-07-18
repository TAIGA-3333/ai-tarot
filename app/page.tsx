import { cookies } from 'next/headers'
import HomeClient from './HomeClient'
import { resolveTikTokCallback, renderTikTokResultFragment } from '@/lib/tiktok-callback'

interface Props {
  searchParams: Promise<{
    code?: string
    state?: string
    error?: string
    error_description?: string
  }>
}

// 重要: TikTok Developer Console側の審査提出フォームの制約により、Redirect URIは
// 現在アプリのルートパス(https://kaiun-oracle.vercel.app/)に登録されたままになっている
// (コンソール側を正式なパス /api/tiktok/callback へ変更・保存できない状態のため)。
// そこで、本来 /api/tiktok/callback で受けるはずのOAuthコールバックをここ(ルートページ)で検知する。
//
// codeパラメータが無い通常のアクセス時は、既存のトップページ(HomeClient)を一切変更せず表示する。
// これが最優先事項 — 通常訪問者の見た目・機能に影響を与えてはならない。
export default async function Page({ searchParams }: Props) {
  const params = await searchParams

  if (!params.code) {
    return <HomeClient />
  }

  // Server Componentではcookieの読み取りのみ可能(書き込みはRoute Handler/Server Actionのみ)。
  // stateの検証用cookieはauthorize側(Route Handler)で設定済みのものをここで読むだけでよい。
  const cookieStore = await cookies()
  const cookieState = cookieStore.get('tiktok_oauth_state')?.value

  const { title, bodyHtml, isError } = await resolveTikTokCallback({
    code: params.code ?? null,
    returnedState: params.state ?? null,
    tiktokError: params.error ?? null,
    tiktokErrorDescription: params.error_description ?? null,
    cookieState,
  })

  const fragment = renderTikTokResultFragment(title, bodyHtml, isError)

  return <div dangerouslySetInnerHTML={{ __html: fragment }} />
}
