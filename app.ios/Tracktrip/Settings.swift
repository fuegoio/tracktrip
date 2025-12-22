import WebKit

struct Cookie {
    var name: String
    var value: String
}

let gcmMessageIDKey = "00000000000" // update this with actual ID if using Firebase 

// URL for first launch
let rootUrl = URL(string: "https://tracktrip.app/travels")!

// allowed origin is for what we are sticking to pwa domain
// This should also appear in Info.plist
let allowedOrigins: [String] = ["tracktrip.app"]

// auth origins will open in modal and show toolbar for back into the main origin.
// These should also appear in Info.plist
let authOrigins: [String] = ["account.google.com", "appleid.apple.com"]
// allowedOrigins + authOrigins <= 10

let platformCookie = Cookie(name: "app-platform", value: "iOS App Store")

// UI options
let displayMode = "standalone" // standalone / fullscreen.
let adaptiveUIStyle = false     // iOS 15+ only. Change app theme on the fly to dark/light related to WebView background color.
let overrideStatusBar = true   // iOS 13-14 only. if you don't support dark/light system theme.
let statusBarTheme = "light"    // dark / light, related to override option. Using light for dark background.
let pullToRefresh = true    // Enable/disable pull down to refresh page
