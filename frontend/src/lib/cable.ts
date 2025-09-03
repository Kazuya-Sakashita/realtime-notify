import * as ActionCable from '@rails/actioncable'

/**
 * 単一インスタンスの consumer を返す
 * (接続URLは NEXT_PUBLIC_WS_URL から取得)
 */
let consumer: ActionCable.Cable | null = null

export function getConsumer(userId: number | string = 1) {
  if (consumer) return consumer

  const baseUrl = process.env.NEXT_PUBLIC_WS_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_WS_URL is not set')
  }

  // 開発用: URL に ?user_id=xx を付加
  const url = `${baseUrl}?user_id=${encodeURIComponent(userId)}`

  consumer = ActionCable.createConsumer(url)
  return consumer
}
