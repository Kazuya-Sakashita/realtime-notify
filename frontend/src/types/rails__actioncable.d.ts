// src/types/rails__actioncable.d.ts
// Minimal typings for @rails/actioncable

declare namespace ActionCable {
  type Identifier = string | Record<string, unknown>

  interface SubscriptionCallbacks {
    connected?(): void
    disconnected?(): void
    received?(data: unknown): void
  }

  interface Channel {
    // 実体はもっと多いが最小限だけ定義
    perform(action: string, data?: unknown): void
    unsubscribe(): void
  }

  interface Subscriptions {
    create(identifier: Identifier, callbacks?: SubscriptionCallbacks): Channel
    remove(channel: Channel): void
  }

  interface Cable {
    subscriptions: Subscriptions
    disconnect(): void
  }

  function createConsumer(url?: string): Cable
}

// CommonJS っぽいエクスポートに合わせた定義（`import * as ActionCable from '@rails/actioncable'` に対応）
declare module '@rails/actioncable' {
  export = ActionCable
}
