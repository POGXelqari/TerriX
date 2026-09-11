# -*- mode: python ; coding: utf-8 -*-
import os
import sys

block_cipher = None

BASE_DIR = os.path.abspath(SPECPATH)
INSTALLER_DIR = os.path.join(BASE_DIR, 'installer')

datas = [
    (os.path.join(BASE_DIR, 'terrix-logo.ico'), '.'),
    (os.path.join(BASE_DIR, 'terrix-logo.png'), '.'),
    (os.path.join(BASE_DIR, 'version.json'), '.'),
    (os.path.join(INSTALLER_DIR, 'windows_env_helper.py'), '.'),
    (os.path.join(INSTALLER_DIR, 'uninstaller.py'), '.'),
]

hiddenimports = [
    'tkinter',
    'tkinter.ttk',
    'tkinter.filedialog',
    'tkinter.messagebox',
    'winreg',
    'ctypes',
]

a = Analysis(
    [os.path.join(INSTALLER_DIR, 'installer_wizard.py')],
    pathex=[BASE_DIR, INSTALLER_DIR, os.path.join(BASE_DIR, 'scripts')],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='TerriX_Setup',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=os.path.join(BASE_DIR, 'terrix-logo.ico'),
    version=os.path.join(BASE_DIR, 'file_version_info.txt'),
)
