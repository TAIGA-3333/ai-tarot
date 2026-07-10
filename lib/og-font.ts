/**
 * next/og (satori) 用に日本語フォント(Noto Sans JP)を実行時に取得するヘルパー。
 *
 * 既知の罠（前回セッションで文字化け・絵文字問題として遭遇したもの）:
 * - Google Fonts の CSS2 API は最新UAへは woff2 を返すが、
 *   next/og が対応しているのは ttf / otf / woff のみ（woff2非対応）。
 *   そのため古いUAを詐称して ttf/otf を取得する必要がある。
 * - text= パラメータで実際に使う文字だけをサブセット指定することで
 *   500KBのバンドル上限に収まる軽量なフォントファイルを取得する。
 *
 * フォント取得に失敗した場合はnullを返す。呼び出し側はデフォルトフォントに
 * フォールバックし、画像生成自体が失敗しないようにする。
 */

const FONT_FAMILY = 'Noto Sans JP'

// 意図的に古いUAを指定し、Google FontsからWOFF2ではなくTTF/OTFを取得する
const LEGACY_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'

export async function loadNotoSansJP(text: string, weight: number = 700): Promise<ArrayBuffer | null> {
  try {
    const uniqueChars = Array.from(new Set(Array.from(text))).join('')
    if (!uniqueChars) return null

    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      FONT_FAMILY
    )}:wght@${weight}&text=${encodeURIComponent(uniqueChars)}`

    const cssRes = await fetch(cssUrl, {
      headers: { 'User-Agent': LEGACY_USER_AGENT },
    })
    if (!cssRes.ok) return null

    const css = await cssRes.text()
    const fontUrlMatch = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)
    const fontUrl = fontUrlMatch?.[1]
    if (!fontUrl) return null

    const fontRes = await fetch(fontUrl)
    if (!fontRes.ok) return null

    return await fontRes.arrayBuffer()
  } catch (error: unknown) {
    console.error('[og-font] Noto Sans JP の取得に失敗:', error instanceof Error ? error.message : error)
    return null
  }
}
