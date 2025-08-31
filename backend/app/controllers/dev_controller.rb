class DevController < ActionController::API
  def cable_test
    render file: Rails.root.join("app/javascript/cable-test.html"),
           layout: false,
           content_type: "text/html"
  end
end
