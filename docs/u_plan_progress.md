# 計画書U v2 実装進捗（U0/U1 = 収益導線 + シェア結果カード）

最終更新: 2026-07-07（実装セッション完了）

## 用語の対応関係（重要）

このセッションで依頼された「U0/U1」は、計画書本体（`automation_hub/docs/2026-07-05_計画書U_ai-tarotバズ進化.md`）の
フェーズ番号とは**ズレている**。依頼時のカッコ書きの内容を正としてこう対応させた:

- 本セッションの **U0（収益導線）** = 計画書本体の **U1**（LINE単一CTA・ヴェルニ枠・クリック計測）
- 本セッションの **U1（シェア結果カード）** = 計画書本体の **U2**（@vercel/og動的OGP・シェア→新規セッション開始）
- 計画書本体の **U0（世界観リブランド／タロット廃止→開運オラクル化）は今回未着手**。
  今回は既存の「月詠タロット」の世界観・UI・文言をそのまま維持し、その上に収益導線とシェア機能を追加した。
  U0リブランドに着手する場合は次回別セッションで。

## 完了した実装

### 収益導線（LINE単一CTA・ヴェルニ枠・クリック計測）

- `lib/supabase.ts` — Supabase接続。環境変数未設定/接続不可時はnullを返す設計（例外を投げない）
- `app/api/track/route.ts` — クリック計測API。Supabase書き込み失敗時も常に200を返し、ユーザー体験を壊さない
- `lib/track.ts` — クライアント側計測ヘルパー。`?src=`をsessionStorageに保持し、sendBeacon優先で送信
- `components/ui/LineCTA.tsx` — 結果画面直下の単一CTA（「毎朝の運命メッセージをLINEで受け取る」）。LINE公式 @101ebuku へのリンク。`NEXT_PUBLIC_LINE_URL`で上書き可
- `components/ui/VerniCTA.tsx` — ヴェルニ枠。`NEXT_PUBLIC_VERNI_URL`未設定時は非表示（登録待ちのため現状はLINEのみ導線）
- `app/page.tsx` — マウント時に`page_view`イベントを記録（`?src=`をtrackEvent内部で自動捕捉）

### シェア結果カード（@vercel/og動的OGP）

- `lib/share.ts` — 鑑定結果（テーマ・カード名・ラッキーカラー）をURLクエリにエンコード/デコード。DB不要でSupabase障害の影響を受けない設計
- `lib/og-font.ts` — Satori(next/og)用に日本語フォント(Noto Sans JP)を実行時取得。Google Fonts CSS2 APIに古いUAを詐称してリクエストし、woff2非対応のnext/ogのためにttf/otfを取得する（既知の罠への対処）
- `app/api/og/route.tsx` — 動的OG画像生成（edge runtime）。前回セッションで問題になった「絵文字/記号の文字化け」を避けるため、装飾はUnicode記号を一切使わずCSSの円のみで表現
- `app/s/page.tsx` — シェア着地ページ。`generateMetadata`で`/api/og`を指すOGP/Twitter Cardを動的生成。友人の結果を表示し「私も占ってもらう→」で`/?src=share`へ誘導（新規セッション開始）
- `components/ui/ShareOpenTracker.tsx` — `/s`ページの開封を計測（`share_open`イベント）
- `components/ui/ShareButton.tsx` — X/LINEシェア両対応に拡張。シェアURLは`/s?...`（旧: 本文のみのツイート→ 新: OGPカード付きURLを含むツイート/LINEシェア）

## 検証結果（ローカル）

1. `npm run build` → **exit 0**（Next.js 16.2.4、Turbopack）
2. `npm run lint` → 新規/変更ファイルは0件のエラー。既存の4件（history/page.tsx, upgrade/page.tsx, CardReveal.tsx, hooks/useTarot.ts の `react-hooks/set-state-in-effect`）は本セッションでは触っていない箇所の既存問題（対象外）
3. `next start`をポート3900で起動し実HTTPで確認:
   - `GET /api/og`（パラメータ無し） → `200 image/png`
   - `GET /api/og?theme=...&cards=...&color=...` → `200 image/png`
   - `GET /s?theme=...&cards=...&color=...&src=twitter` → `200`、`<title>`と`og:image`が動的に生成されていることを確認
   - `POST /api/track` 正常系 → `{"ok":true}`
   - `POST /api/track` 不正イベント/不正JSON/空ボディ → いずれも`200 {"ok":false,...}`（クラッシュしない）
4. **既知の制限**: このセッションの実行環境（サンドボックス）は外部インターネットに出られないため（`google.com`へのcurlも失敗を確認済み）、
   Noto Sans JPフォントの実フェッチ自体はローカルでは検証できていない。コードは正しくフォールバック（フォント取得失敗時はSatoriのデフォルトフォントで描画し、画像生成自体はクラッシュしない）することを確認済み。
   本番Vercel環境（外部インターネット到達可能）での日本語文字の実際の描画結果は**要確認**。

## 本番投入前にオーナーが設定すべき環境変数（Vercel）

| 変数名 | 用途 | 現状 |
|---|---|---|
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | クリック計測(`oracle_clicks`テーブルへのinsert) | 未設定でも動作する（計測がスキップされるだけ）。Supabase復旧後に設定 |
| `NEXT_PUBLIC_LINE_URL` | LINE公式アカウントへの誘導リンク | 未設定時は`https://line.me/R/ti/p/%40101ebuku`をデフォルト使用 |
| `NEXT_PUBLIC_VERNI_URL` | ヴェルニアフィリンク | 未設定 → ヴェルニ枠は非表示（登録待ちのため意図的） |

Supabase側で`oracle_clicks`テーブル（列: `event` text, `src` text, `path` text, `meta` jsonb, `created_at` timestamptz default now()）の作成が別途必要。

## 残タスク（次回セッション）

- [ ] Supabase復旧後、`oracle_clicks`テーブル作成＋`SUPABASE_URL`/`SUPABASE_ANON_KEY`をVercelに設定
- [ ] ヴェルニ登録後、`NEXT_PUBLIC_VERNI_URL`をVercelに設定してヴェルニ枠を有効化
- [ ] 本番デプロイ後、実際にXでシェア→OGPカードが正しく展開されるかを実機確認（日本語フォント含む）
- [ ] 計画書本体のU0（世界観リブランド）は今回スコープ外。着手する場合は別セッションで発注
- [ ] U3（動画ファネル接続）着手時、`?src=tiktok`等の実際の流入元をTikTok/YT/IGプロフィールURLに反映
