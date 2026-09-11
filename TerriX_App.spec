# -*- mode: python ; coding: utf-8 -*-
import os
import sys

block_cipher = None

BASE_DIR = os.path.abspath(SPECPATH)

datas = [
    (os.path.join(BASE_DIR, 'gui'), 'gui'),
    (os.path.join(BASE_DIR, 'assets'), 'assets'),
    (os.path.join(BASE_DIR, 'data'), 'data'),
    (os.path.join(BASE_DIR, 'scripts'), 'scripts'),
    (os.path.join(BASE_DIR, 'ezsolver_repo'), 'ezsolver_repo'),
    (os.path.join(BASE_DIR, 'terrix-logo.ico'), '.'),
    (os.path.join(BASE_DIR, 'terrix-logo.png'), '.'),
    (os.path.join(BASE_DIR, 'version.json'), '.'),
    (os.path.join(BASE_DIR, 'proxy.txt'), '.'),
]

hiddenimports = [
    'websockets',
    'websockets_proxy',
    'python_socks',
    'nodriver',
    'webview',
    'fastapi',
    'uvicorn',
    'starlette',
    'pydantic',
    'multiprocessing',
    'asyncio',
    'swarm_orchestrator',
    'dynamic_proxy_fetcher',
    'account_creator',
    'token_pool',
    'lobby_coordinator',
    'direct_websocket_engine',
    'proxy_manager',
    'game_protocol_parser',
    'key_guardian',
    'supabase_key_manager',
    'identity_manager',
    'cloud_sync',
    'version_manager',
]

a = Analysis(
    ['executor_app.py'],
    pathex=[BASE_DIR, os.path.join(BASE_DIR, 'scripts')],
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
    name='terrix',
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
