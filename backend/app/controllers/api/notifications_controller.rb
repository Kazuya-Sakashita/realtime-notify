# app/controllers/api/notifications_controller.rb
class Api::NotificationsController < ApplicationController
  before_action :require_user! # 認証の都合に合わせて適宜

  def create
    NotificationService.push_to(
      user_id: current_user.id,
      payload: {
        title: params[:title] || "通知",
        body:  params[:body]  || "テスト通知です",
        kind:  params[:kind]  || "test",
        url:   params[:url]
      }
    )
    head :ok
  end
end
