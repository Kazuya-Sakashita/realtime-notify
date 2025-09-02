# frozen_string_literal: true

class NotificationsChannel < ApplicationCable::Channel
  def subscribed
    # ← ここで current_user は使わない
    reject unless connection.user_id

    stream_from stream_name

    # 接続直後に直近10分の backlog を古い→新しい順で送信
    backlog = NotificationCache.fetch_backlog(connection.user_id)
    backlog.sort_by { |p| p['at'] || p[:at] }.each { |payload| transmit(payload) } if backlog.present?
  end

  private

  def stream_name
    "notif:#{connection.user_id}"
  end
end
