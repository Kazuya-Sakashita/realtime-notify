class PingChannel < ApplicationCable::Channel
  def subscribed
    Rails.logger.info "[PingChannel] subscribed: #{connection.connection_identifier rescue 'n/a'}"
    stream_from "ping"
  end
end
