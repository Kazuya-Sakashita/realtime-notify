'use client'

import { usePing } from '@/hooks/usePing'

export default function PingPage() {
  const { lastMessage } = usePing()

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ping Listener</h1>
      <p className="text-sm text-muted-foreground">
        Rails の <code>ActionCable.server.broadcast(&quot;ping&quot;, &#123; ... &#125;)</code> を受信してログ出力します。
      </p>

      <div className="rounded-xl border p-4">
        <div className="font-mono text-sm">
          <div className="opacity-70">Last Message</div>
          <pre className="mt-2 whitespace-pre-wrap break-words">
{JSON.stringify(lastMessage ?? '(waiting...)', null, 2)}
          </pre>
        </div>
      </div>
    </main>
  )
}
