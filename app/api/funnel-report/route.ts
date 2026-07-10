import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL! // .env.local に追加が必要

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(req: Request) {
  // セキュリティ: ヘッダーに特定のシークレットがあるか（cron用）
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // 過去7日間のクリックデータを取得
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: clicks, error } = await supabase
      .from('oracle_clicks')
      .select('label, src, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    if (error) throw error

    // 集計
    const counts = {
      line_cta: 0,
      vernier_cta: 0,
      x_share: 0,
      line_share: 0,
    }
    
    const sources = {} as Record<string, number>

    clicks?.forEach(click => {
      if (click.label in counts) {
        counts[click.label as keyof typeof counts]++
      }
      sources[click.src] = (sources[click.src] || 0) + 1
    })

    // Discordメッセージ作成
    const message = {
      content: `📊 **開運オラクル 週次ファネルレポート** (過去7日間)\n\n` +
               `**▼ アクション別クリック数**\n` +
               `🟢 LINE登録CTA: ${counts.line_cta}回\n` +
               `🔮 ヴェルニCTA: ${counts.vernier_cta}回\n` +
               `🐦 Xでシェア: ${counts.x_share}回\n` +
               `💬 LINEでシェア: ${counts.line_share}回\n\n` +
               `**▼ 流入元 (TOP 3)**\n` +
               Object.entries(sources)
                 .sort((a, b) => b[1] - a[1])
                 .slice(0, 3)
                 .map(([src, count]) => `・ ${src}: ${count}回`)
                 .join('\n')
    }

    if (discordWebhookUrl) {
      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })
    }

    return NextResponse.json({ ok: true, counts })
  } catch (e: any) {
    console.error('Funnel report error:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
