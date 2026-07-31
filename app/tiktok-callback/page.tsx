// TikTok OAuth コールバック専用ページ（スクリプト連携用）
// state検証を行わず、受け取った code をそのまま画面に表示する。
// 目的: upload_tiktok_api.py の --exchange-code に渡すコードを人間がコピーできるようにする。
import { Suspense } from "react";

function TikTokCallbackInner({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const code = searchParams["code"];
  const error = searchParams["error"];
  const errorDesc = searchParams["error_description"];

  if (error) {
    return (
      <main style={{ fontFamily: "monospace", padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>❌ TikTok 認証エラー</h1>
        <p><strong>error:</strong> {String(error)}</p>
        {errorDesc && <p><strong>description:</strong> {String(errorDesc)}</p>}
      </main>
    );
  }

  if (!code) {
    return (
      <main style={{ fontFamily: "monospace", padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>TikTok コールバック</h1>
        <p style={{ color: "#888" }}>code パラメータが見つかりません。</p>
      </main>
    );
  }

  const codeStr = Array.isArray(code) ? code[0] : code;

  return (
    <main style={{ fontFamily: "monospace", padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "#00aa00" }}>✅ 認可コード取得成功</h1>
      <p>以下のコードをコピーして、エージェントに貼り付けてください。</p>
      <div
        style={{
          background: "#1a1a1a",
          color: "#00ff88",
          padding: "20px",
          borderRadius: "8px",
          fontSize: "18px",
          wordBreak: "break-all",
          marginTop: "16px",
          border: "2px solid #00aa44",
        }}
      >
        {codeStr}
      </div>
      <p style={{ color: "#888", fontSize: "13px", marginTop: "16px" }}>
        ⚠️ このコードは一度しか使えません。すぐにコピーして使用してください。
      </p>
    </main>
  );
}

export default async function TikTokCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<p style={{ padding: "40px", fontFamily: "monospace" }}>読み込み中...</p>}>
      <TikTokCallbackInner searchParams={params} />
    </Suspense>
  );
}
