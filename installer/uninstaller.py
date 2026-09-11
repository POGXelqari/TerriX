#!/usr/bin/env python3
"""
TerriX Uninstaller
==================
Cleanly removes TerriX Executor from the Windows system:
- Deletes Desktop and Start Menu shortcuts
- Cleans HKCU\\Environment\\PATH
- Removes protocol handler and Add/Remove Programs registry keys
- Deletes application files
"""

import os
import sys
import shutil
import winreg
import ctypes
import subprocess

def clean_registry():
    # Remove Uninstall key
    try:
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Uninstall\TerriX")
    except Exception:
        pass

    # Remove protocol
    try:
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\terrix\shell\open\command")
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\terrix\shell\open")
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\terrix\shell")
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\terrix\DefaultIcon")
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\terrix")
    except Exception:
        pass

def clean_shortcuts():
    desktop_lnk = os.path.expandvars(r"%USERPROFILE%\Desktop\TerriX.lnk")
    if os.path.exists(desktop_lnk):
        try: os.remove(desktop_lnk)
        except Exception: pass

    start_menu_dir = os.path.expandvars(r"%APPDATA%\Microsoft\Windows\Start Menu\Programs\TerriX")
    if os.path.exists(start_menu_dir):
        try: shutil.rmtree(start_menu_dir, ignore_errors=True)
        except Exception: pass

def clean_path(install_dir: str):
    try:
        from windows_env_helper import remove_from_user_path
        remove_from_user_path(install_dir)
    except Exception:
        pass

def main():
    install_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Prompt confirmation in GUI mode if running as .exe
    if "--silent" not in sys.argv:
        res = ctypes.windll.user32.MessageBoxW(
            0,
            f"Are you sure you want to completely uninstall TerriX Executor from:\n{install_dir}?",
            "Uninstall TerriX Executor",
            1  # MB_OKCANCEL
        )
        if res != 1:
            sys.exit(0)

    print("[*] Cleaning registry entries...")
    clean_registry()

    print("[*] Cleaning shortcuts...")
    clean_shortcuts()

    print("[*] Removing from user PATH...")
    clean_path(install_dir)

    # Schedule self-deletion of directory via cmd
    cmd_self_delete = f'cmd /c ping 127.0.0.1 -n 2 > nul & rmdir /s /q "{install_dir}"'
    subprocess.Popen(cmd_self_delete, shell=True)

    if "--silent" not in sys.argv:
        ctypes.windll.user32.MessageBoxW(
            0,
            "TerriX Executor has been successfully uninstalled from your computer.",
            "Uninstall Complete",
            0  # MB_OK
        )

if __name__ == "__main__":
    main()
