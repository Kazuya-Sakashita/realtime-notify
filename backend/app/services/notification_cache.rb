# backend/app/services/notification_cache.rb
# frozen_string_literal: true

class NotificationCache
  # --- 安全に ENV 数値を読む小ヘルパ ---
  def self.read_env_positive_int(name, default)
    raw = ENV[name]
    val = Integer(raw, exception: false) # 無効なら nil
    val && val > 0 ? val : default
  end
  private_class_method :read_env_positive_int

  # ===== 可変TTL（開発検証用） =====
  SECONDS   = read_env_positive_int("NOTIF_TTL_SECONDS", 600) # 10分=600
  INDEX_TTL = SECONDS.seconds
  ITEM_TTL  = SECONDS.seconds

  # 索引の最大保持件数（暴走防止）
  INDEX_MAX = read_env_positive_int("NOTIF_INDEX_MAX", 200)

  class << self
    # 通知を保存し、索引を更新して key を返す
    def write_and_index(user_id, payload, ttl_seconds: nil)
      key = build_item_key(user_id)
      now = Time.current
      id  = key.split(':').last

      ttl = begin
        v = Integer(ttl_seconds, exception: false)
        v && v > 0 ? v.seconds : ITEM_TTL
      end

      Rails.cache.write(
    key,
    payload.merge(
      'id'        => id,
      'at'        => now.iso8601,
      'saved_at'  => now,
      'ttl'       => ttl.to_i,                      # ← 追加: 秒
      'expire_at' => (now + ttl).iso8601            # ← 追加: 絶対時刻
    ),
        expires_in: ttl
      )

      index_key = build_index_key(user_id)
      index = Rails.cache.read(index_key) || []
      index << { 'key' => key, 'exp' => ttl.from_now }
      index = prune(index)
      # 索引のTTLは項目のTTLより長くならないようにする
      Rails.cache.write(index_key, index, expires_in: [INDEX_TTL, ttl].min)

      key
    end

    # 直近TTL内の通知をまとめて取得
    def fetch_backlog(user_id)
      index_key = build_index_key(user_id)
      index = Rails.cache.read(index_key) || []
      valid = prune(index)
      keys  = valid.map { |e| e['key'] }

      payloads =
        if keys.empty?
          []
        else
          Rails.cache.read_multi(*keys).values.compact
        end

      Rails.cache.write(index_key, valid, expires_in: INDEX_TTL)
      payloads
    end

    private

    def prune(index)
      now = Time.current
      index.select { |e| e['exp'] > now }.last(INDEX_MAX)
    end

    def build_index_key(user_id)
      "notif:index:#{user_id}"
    end

    def build_item_key(user_id)
      "notif:item:#{user_id}:#{SecureRandom.uuid}"
    end
  end
end
