'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useNotifications, type NotificationPayload } from '@/app/hooks/useNotifications'

export default function NotificationsPage() {
  const { notifications } = useNotifications()
  const [now, setNow] = useState(() => Date.now())

  // 1秒ごとに再描画（カウントダウン更新）
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const remainingSeconds = (n: NotificationPayload) => {
    const atMs = n.at ? new Date(n.at).getTime() : now
    const expMs = n.expire_at
      ? new Date(n.expire_at).getTime()
      : n.ttl
        ? atMs + n.ttl * 1000
        : undefined
    if (expMs === undefined) return null
    return Math.max(0, Math.ceil((expMs - now) / 1000))
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notifications (TTL 表示)</h1>
      <p className="text-sm text-muted-foreground">
        サーバは <code>ttl</code> / <code>expire_at</code> を付与。フロントはそれに従って自動消滅＆カウントダウン。
      </p>

      <ul className="space-y-3">
        {notifications.length === 0 && (
          <li className="text-sm opacity-70">（通知待ち）</li>
        )}

        {notifications.map((n, i) => {
          const remain = remainingSeconds(n)
          return (
            <li key={n.id ?? i} className="rounded-xl border p-4">
              <div className="font-semibold">{n.title}</div>
              {n.body && <div className="text-sm mt-1">{n.body}</div>}

              <div className="text-xs opacity-60 mt-2 space-y-1">
                <div>
                  kind: {n.kind ?? '—'}
                  {n.saved_at && <> • saved_at: {n.saved_at}</>}
                </div>
                {(n.expire_at || n.ttl) && (
                  <div>
                    {n.expire_at ? <>expire_at: {n.expire_at}</> : <>ttl: {n.ttl}s</>}
                    {remain !== null && <> • 残り {remain} 秒</>}
                  </div>
                )}
              </div>

              {n.url && (
                <div className="mt-2">
                  <Link href={n.url} className="text-blue-600 underline">
                    開く
                  </Link>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* データの生表示（切り分け用） */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold">Raw payloads</h2>
  <pre
    className="
      text-xs rounded-md border overflow-auto p-3
      bg-gray-50 text-gray-900 border-gray-200
      dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800
    "
  >
          {JSON.stringify(notifications, null, 2)}
        </pre>
      </div>
    </main>
  )
}
