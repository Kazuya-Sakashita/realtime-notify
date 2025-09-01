'use client'

import { useEffect, useRef, useState } from 'react'
import type { Channel } from '@rails/actioncable'
import { getConsumer } from '@/lib/cable'

type PingPayload = {
  message?: string
  at?: string
  [key: string]: unknown
}

/**
 * Ping チャンネルを購読し、最後に受信したメッセージを返す
 * 受信内容は console.log も行う
 */
export function usePing() {
  const [lastMessage, setLastMessage] = useState<PingPayload | null>(null)
  const subscriptionRef = useRef<Channel | null>(null)

  useEffect(() => {
    const consumer = getConsumer()
    // Rails 側に PingChannel がある前提:
    // class PingChannel < ApplicationCable::Channel
    //   def subscribed; stream_from "ping"; end
    // end
    const subscription = consumer.subscriptions.create(
      { channel: 'PingChannel' },
      {
        connected() {
          // 接続確立時
          // console.log('ActionCable connected')
        },
        disconnected() {
          // 切断時
          // console.log('ActionCable disconnected')
        },
        received(data: PingPayload) {
          console.log('[Ping] received:', data)
          setLastMessage(data)
        },
      },
    )

    subscriptionRef.current = subscription
    return () => {
      if (subscriptionRef.current) {
        consumer.subscriptions.remove(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [])

  return { lastMessage }
}
