# app/services/notification_service.rb
class NotificationService
  STREAM_PREFIX = "notif:"

  # payload 例:
  # { title: "新着メッセージ", body: "〇〇さんから…", kind: "message", url: "/inbox/..." }
  def self.push_to(user_id:, payload:)
    # 1) Cache に保存（TTL 10分 & index）
    NotificationCache.write_and_index(user_id, payload)

    # 2) Push 配信
    ActionCable.server.broadcast("#{STREAM_PREFIX}#{user_id}", payload)
  end
end
