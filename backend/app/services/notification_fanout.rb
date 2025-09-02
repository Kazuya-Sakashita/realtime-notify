# backend/app/services/notification_fanout.rb
# frozen_string_literal: true

class NotificationFanout
  def self.push(user_id, payload, ttl_seconds: nil)
    key  = NotificationCache.write_and_index(user_id, payload, ttl_seconds: ttl_seconds) # ← 渡す
    item = Rails.cache.read(key)
    ActionCable.server.broadcast("notif:#{user_id}", item) if item
    item
  end

  def self.stream_name(user_id)
    "notif:#{user_id}"
  end
  private_class_method :stream_name
end
