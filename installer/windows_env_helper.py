#!/usr/bin/env python3
"""
TerriX Windows Environment & Integration Helper
================================================
Configures Windows system integration:
1. Registers install directory in user PATH (HKCU\\Environment\\PATH)
2. Registers terrix:// URL protocol handler
3. Creates Desktop and Start Menu .lnk shortcuts with terrix-logo.ico
4. Registers Add/Remove Programs uninstaller metadata in Windows Registry
"""

import os
import sys
import winreg
import ctypes
import subprocess

HWND_BROADCAST = 0xFFFF
WM_SETTINGCHANGE = 0x001A
SMTO_ABORTIFHUNG = 0x0002

def add_to_user_path(directory: str) -> bool:
    """Appends directory to HKCU\\Environment\\PATH if not already present."""
    directory = os.path.abspath(directory)
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment", 0, winreg.KEY_READ | winreg.KEY_WRITE) as key:
            try:
                current_path, _ = winreg.QueryValueEx(key, "Path")
            except FileNotFoundError:
                current_path = ""
                
            paths = [p.strip() for p in current_path.split(";") if p.strip()]
            if directory not in paths:
                paths.append(directory)
                new_path = ";".join(paths)
                winreg.SetValueEx(key, "Path", 0, winreg.REG_EXPAND_SZ, new_path)
                
        # Broadcast settings change to notify open windows and terminals
        result = ctypes.c_long()
        ctypes.windll.user32.SendMessageTimeoutW(
            HWND_BROADCAST, WM_SETTINGCHANGE, 0, "Environment",
            SMTO_ABORTIFHUNG, 5000, ctypes.byref(result)
        )
        return True
    except Exception as e:
        print(f"[!] Error adding to PATH: {e}")
        return False

def remove_from_user_path(directory: str) -> bool:
    """Removes directory from HKCU\\Environment\\PATH."""
    directory = os.path.abspath(directory)
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment", 0, winreg.KEY_READ | winreg.KEY_WRITE) as key:
            try:
                current_path, _ = winreg.QueryValueEx(key, "Path")
            except FileNotFoundError:
                return True
                
            paths = [p.strip() for p in current_path.split(";") if p.strip() and p.strip().lower() != directory.lower()]
            new_path = ";".join(paths)
            winreg.SetValueEx(key, "Path", 0, winreg.REG_EXPAND_SZ, new_path)
            
        result = ctypes.c_long()
        ctypes.windll.user32.SendMessageTimeoutW(
            HWND_BROADCAST, WM_SETTINGCHANGE, 0, "Environment",
            SMTO_ABORTIFHUNG, 5000, ctypes.byref(result)
        )
        return True
    except Exception as e:
        print(f"[!] Error removing from PATH: {e}")
        return False

def register_protocol_handler(exe_path: str) -> bool:
    """Registers the terrix:// URL protocol in HKCU\\Software\\Classes\\terrix."""
    exe_path = os.path.abspath(exe_path)
    try:
        base_key_path = r"Software\Classes\terrix"
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, base_key_path) as key:
            winreg.SetValueEx(key, "", 0, winreg.REG_SZ, "URL:TerriX Protocol")
            winreg.SetValueEx(key, "URL Protocol", 0, winreg.REG_SZ, "")
            
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, base_key_path + r"\DefaultIcon") as key:
            winreg.SetValueEx(key, "", 0, winreg.REG_SZ, f'"{exe_path}",0')
            
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, base_key_path + r"\shell\open\command") as key:
            winreg.SetValueEx(key, "", 0, winreg.REG_SZ, f'"{exe_path}" "%1"')
            
        return True
    except Exception as e:
        print(f"[!] Error registering protocol: {e}")
        return False

def create_windows_shortcut(target_exe: str, shortcut_path: str, icon_path: str = None, working_dir: str = None):
    """Creates a Windows .lnk shortcut using WScript.Shell."""
    target_exe = os.path.abspath(target_exe)
    shortcut_path = os.path.abspath(shortcut_path)
    if not working_dir:
        working_dir = os.path.dirname(target_exe)
        
    os.makedirs(os.path.dirname(shortcut_path), exist_ok=True)
    
    ps_cmd = f'''
    $ws = New-Object -ComObject WScript.Shell;
    $s = $ws.CreateShortcut("{shortcut_path}");
    $s.TargetPath = "{target_exe}";
    $s.WorkingDirectory = "{working_dir}";
    '''
    if icon_path and os.path.exists(icon_path):
        ps_cmd += f'$s.IconLocation = "{os.path.abspath(icon_path)},0";'
    ps_cmd += '$s.Save();'
    
    subprocess.run(["powershell", "-NoProfile", "-Command", ps_cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def register_uninstaller(install_dir: str, version: str = "4.0.0.0.0.0.0.0") -> bool:
    """Registers the application in Windows Add/Remove Programs."""
    install_dir = os.path.abspath(install_dir)
    exe_path = os.path.join(install_dir, "terrix.exe")
    uninst_path = os.path.join(install_dir, "Uninstall.exe")
    icon_path = os.path.join(install_dir, "terrix-logo.ico")
    
    try:
        reg_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\TerriX"
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, reg_path) as key:
            winreg.SetValueEx(key, "DisplayName", 0, winreg.REG_SZ, "TerriX Executor")
            winreg.SetValueEx(key, "DisplayVersion", 0, winreg.REG_SZ, version)
            winreg.SetValueEx(key, "Publisher", 0, winreg.REG_SZ, "TerriX")
            winreg.SetValueEx(key, "InstallLocation", 0, winreg.REG_SZ, install_dir)
            winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, f'"{uninst_path}"')
            if os.path.exists(icon_path):
                winreg.SetValueEx(key, "DisplayIcon", 0, winreg.REG_SZ, f'"{icon_path}",0')
            else:
                winreg.SetValueEx(key, "DisplayIcon", 0, winreg.REG_SZ, f'"{exe_path}",0')
        return True
    except Exception as e:
        print(f"[!] Error registering uninstaller: {e}")
        return False
