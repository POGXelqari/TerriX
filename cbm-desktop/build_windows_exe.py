#!/usr/bin/env python3
"""
Clan Bank Manager (CBM) — Windows Native Binary Compiler
========================================================
Compiles cbm_app.py into a standalone portable ClanBankManager.exe.
"""

import os
import sys
import shutil
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ICON_PATH = os.path.join(SCRIPT_DIR, "icons", "icon.ico")
DIST_DIR = os.path.join(SCRIPT_DIR, "dist")
BUILD_DIR = os.path.join(SCRIPT_DIR, "build")
ENTRY_POINT = os.path.join(SCRIPT_DIR, "cbm_app.py")


def build():
    print("=" * 60)
    print("Compiling Clan Bank Manager Native Windows Binary (.exe)")
    print("=" * 60)

    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconfirm",
        "--clean",
        "--windowed",
        "--onefile",
        "--name=ClanBankManager",
        f"--icon={ICON_PATH}",
        f"--distpath={DIST_DIR}",
        f"--workpath={BUILD_DIR}",
        "--hidden-import=webview",
        "--hidden-import=clr",
        "--hidden-import=pythonnet",
        ENTRY_POINT
    ]

    print(f"Running PyInstaller: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=SCRIPT_DIR)
    if res.returncode != 0:
        print("[!] Compilation failed!")
        sys.exit(res.returncode)

    exe_path = os.path.join(DIST_DIR, "ClanBankManager.exe")
    if os.path.exists(exe_path):
        size_mb = round(os.path.getsize(exe_path) / (1024 * 1024), 2)
        print("=" * 60)
        print(f"[+] Build Successful: {exe_path} ({size_mb} MB)")
        print("=" * 60)
    else:
        print("[!] ClanBankManager.exe not found in output directory!")
        sys.exit(1)


if __name__ == "__main__":
    build()
