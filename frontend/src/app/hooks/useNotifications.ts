'use client'

import { useEffect, useRef, useState } from 'react'
/* cspell:disable-next-line */
import type { Channel } from '@rails/actioncable'
import { getConsumer } from '@/lib/cable'

export type NotificationPayload = {
  id?: string
  title: string
  body?: string
  kind?: string
  url?: string
  at?: string          // ISO
  saved_at?: string    // ISO
  ttl?: number         // 秒（サーバ付与）
  expire_at?: string   // ISO（サーバ付与）
}

export function useNotifications(userId?: number | string) {
  const [list, setList] = useState<NotificationPayload[]>([])
  const subRef = useRef<Channel | null>(null)
  const timersRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const consumer = userId == null ? getConsumer() : getConsumer(userId)

    const ensureId = (n: NotificationPayload) =>
      n.id ?? `${n.title}:${n.body ?? ''}:${n.at ?? ''}`

    const ensureAt = (n: NotificationPayload) =>
      n.at ?? new Date().toISOString()

    const isExpired = (n: NotificationPayload, nowMs: number) => {
      const atMs = n.at ? new Date(n.at).getTime() : nowMs
      const expMs = n.expire_at
        ? new Date(n.expire_at).getTime()
        : n.ttl
          ? atMs + n.ttl * 1000
          : undefined
      return expMs !== undefined && expMs <= nowMs
    }

    const armTimer = (n: NotificationPayload) => {
      const id = ensureId(n)
      const atMs = n.at ? new Date(n.at).getTime() : Date.now()
      const expMs = n.expire_at
        ? new Date(n.expire_at).getTime()
        : n.ttl
          ? atMs + n.ttl * 1000
          : undefined
      if (expMs === undefined) return

      const delay = Math.max(0, expMs - Date.now())

      const prev = timersRef.current.get(id)
      if (prev) window.clearTimeout(prev)

      if (delay === 0) {
        setList(prev => prev.filter(x => ensureId(x) !== id))
        timersRef.current.delete(id)
        return
      }

      const t = window.setTimeout(() => {
        setList(prev => prev.filter(x => ensureId(x) !== id))
        timersRef.current.delete(id)
      }, delay)
      timersRef.current.set(id, t)
    }

    const sweep = () => {
      const now = Date.now()
      setList(prev => prev.filter(n => !isExpired(n, now)))
    }

    const sub = consumer.subscriptions.create(
      { channel: 'NotificationsChannel' },
      {
        received(raw: unknown) {
          const data = raw as NotificationPayload
          const filled: NotificationPayload = {
            ...data,
            id: ensureId(data),
            at: ensureAt(data),
          }

          console.log('[Cable] received', filled) // ← 受信ログ（切り分け用）

          setList(prev => {
            const map = new Map(prev.map(x => [ensureId(x), x]))
            map.set(ensureId(filled), filled)
            return Array.from(map.values())
              .sort((a, b) => (+new Date(b.at ?? 0)) - (+new Date(a.at ?? 0)))
              .slice(0, 100)
          })

          if (isExpired(filled, Date.now())) {
            setList(prev => prev.filter(n => ensureId(n) !== ensureId(filled)))
          } else {
            armTimer(filled)
          }
        },
        connected() { /* console.debug('[Cable] connected') */ },
        disconnected() { /* console.debug('[Cable] disconnected') */ },
      },
    )

    subRef.current = sub

    const interval = window.setInterval(sweep, 5000)
    const onVis = () => document.visibilityState === 'visible' && sweep()
    document.addEventListener('visibilitychange', onVis)

    return () => {
      const timers = timersRef.current
      subRef.current?.unsubscribe?.()
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVis)
      timers.forEach(id => window.clearTimeout(id))
      timersRef.current.clear()
      subRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // getConsumer は初回で URL が固定されるため依存は空でOK

  return { notifications: list }
}
