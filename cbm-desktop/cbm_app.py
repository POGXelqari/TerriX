#!/usr/bin/env python3
"""
Clan Bank Manager (CBM) — Native Windows Desktop Client
======================================================
Hardware-accelerated Microsoft Edge WebView2 runtime.
Single portable executable for Windows x64.
"""

import os
import sys
import webview

TARGET_URL = "https://cbm.wispbyte.org/cbm.html"
APP_TITLE = "Clan Bank Manager (CBM)"
BG_COLOR = "#080d16"
WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 840
MIN_WIDTH = 960
MIN_HEIGHT = 640


class CBMDesktopBridge:
    def __init__(self):
        self.version = "1.0.0"

    def get_client_platform(self):
        return {
            "platform": "windows",
            "runtime": "Edge WebView2",
            "native": True,
            "version": self.version
        }


def main():
    bridge = CBMDesktopBridge()

    window = webview.create_window(
        title=APP_TITLE,
        url=TARGET_URL,
        js_api=bridge,
        width=WINDOW_WIDTH,
        height=WINDOW_HEIGHT,
        min_size=(MIN_WIDTH, MIN_HEIGHT),
        resizable=True,
        fullscreen=False,
        background_color=BG_COLOR,
        confirm_close=False,
        text_select=True
    )

    # Launch Edge WebView2 hardware-accelerated GUI
    webview.start(
        gui="edgechromium",
        debug=False,
        private_mode=False,
        storage_path=os.path.join(os.environ.get("APPDATA", "."), "ClanBankManager")
    )


if __name__ == "__main__":
    main()
