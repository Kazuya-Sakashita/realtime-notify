class Api::NotificationsDebugController < ApplicationController
  before_action :ensure_development!

  def create
    uid = (params[:user_id].presence || 1).to_i
    ttl = Integer(params[:ttl_seconds], exception: false) # ← 追加

    payload = {
      'kind'  => params[:kind]  || 'invite',
      'title' => params[:title] || 'テスト通知',
      'body'  => params[:body]  || 'これはテストです'
    }

    # ↓ ttl_seconds を渡す
    item = NotificationFanout.push(uid, payload, ttl_seconds: ttl)
    render json: { ok: item.present?, item: item }, status: :ok
  end

  private
  def ensure_development!
    head :forbidden unless Rails.env.development?
  end
end
