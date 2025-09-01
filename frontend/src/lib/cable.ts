import * as ActionCable from '@rails/actioncable'

/**
 * 単一インスタンスの consumer を返す
 * (接続URLは NEXT_PUBLIC_WS_URL から取得)
 */
let consumer: ActionCable.Cable | null = null

export function getConsumer() {
  if (consumer) return consumer
  const url = process.env.NEXT_PUBLIC_WS_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_WS_URL is not set')
  }
  consumer = ActionCable.createConsumer(url)
  return consumer
}
