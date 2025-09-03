# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :user_id

    def connect
      self.user_id = request.params["user_id"]&.to_i
      reject_unauthorized_connection unless user_id.present?
    end
  end
end
