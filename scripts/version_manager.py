#!/usr/bin/env python3
"""
TerriX Octuple Version Manager (4.0.0.0.0.0.0.0)
=================================================
Manages the 8-tier hierarchical versioning engine:
[V1].[V2].[V3].[V4].[V5].[V6].[V7].[V8]
Default baseline: 4.0.0.0.0.0.0.0
Incremental bump: +0.0.0.0.0.0.0.1 (V8 revision tier)
"""

import json
import os
import sys
import datetime
import argparse

PE_VERSION_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "file_version_info.txt")

def get_version_file() -> str:
    candidates = []
    if getattr(sys, 'frozen', False):
        meipass = getattr(sys, '_MEIPASS', None)
        if meipass:
            candidates.append(os.path.join(meipass, "version.json"))
        candidates.append(os.path.join(os.path.dirname(sys.executable), "version.json"))
    candidates.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "version.json"))
    candidates.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "version.json"))
    candidates.append(os.path.abspath("version.json"))
    for c in candidates:
        if os.path.isfile(c):
            return c
    return candidates[0]

DEFAULT_VERSION = {
    "version": "4.0.0.0.0.0.0.0",
    "major": 4,
    "epoch": 0,
    "subsystem": 0,
    "gui": 0,
    "network": 0,
    "turnstile": 0,
    "protocol": 0,
    "revision": 0,
    "build_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
}

def load_version_data():
    vfile = get_version_file()
    if not os.path.exists(vfile):
        return DEFAULT_VERSION.copy()
    try:
        with open(vfile, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_VERSION.copy()

def save_version_data(data):
    vfile = get_version_file()
    try:
        with open(vfile, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

def get_version_string():
    data = load_version_data()
    return data.get("version", "4.0.0.0.0.0.0.0")

def bump_patch():
    """Increments the V8 atomic revision tier by +1 (+0.0.0.0.0.0.0.1)."""
    data = load_version_data()
    data["revision"] = data.get("revision", 0) + 1
    data["version"] = f"{data.get('major', 4)}.{data.get('epoch', 0)}.{data.get('subsystem', 0)}.{data.get('gui', 0)}.{data.get('network', 0)}.{data.get('turnstile', 0)}.{data.get('protocol', 0)}.{data['revision']}"
    data["build_timestamp"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    save_version_data(data)
    generate_pe_version_info()
    return data["version"]

def generate_pe_version_info(target_path=PE_VERSION_FILE):
    """Generates PyInstaller-compatible Windows PE version resource script."""
    data = load_version_data()
    ver_str = data.get("version", "4.0.0.0.0.0.0.0")
    major = data.get("major", 4)
    epoch = data.get("epoch", 0)
    subsystem = data.get("subsystem", 0)
    rev = data.get("revision", 0)
    
    # Windows PE resource struct accepts 4-tuple for binary version
    pe_content = f'''# UTF-8
#
# Windows PE Version Resource Descriptor for TerriX Executor
#
VSVersionInfo(
  ffi=FixedFileInfo(
    filevers=({major}, {epoch}, {subsystem}, {rev}),
    prodvers=({major}, {epoch}, {subsystem}, {rev}),
    mask=0x3f,
    flags=0x0,
    OS=0x40004,
    fileType=0x1,
    subtype=0x0,
    date=(0, 0)
  ),
  kids=[
    StringFileInfo(
      [
        StringTable(
          '040904b0',
          [
            StringStruct('CompanyName', 'TerriX Red Team'),
            StringStruct('FileDescription', 'TerriX Executor - Swarm Engine & Research Suite'),
            StringStruct('FileVersion', '{ver_str}'),
            StringStruct('InternalName', 'terrix'),
            StringStruct('LegalCopyright', 'Copyright (c) 2026 TerriX. All rights reserved.'),
            StringStruct('OriginalFilename', 'terrix.exe'),
            StringStruct('ProductName', 'TerriX Executor'),
            StringStruct('ProductVersion', '{ver_str}')
          ]
        )
      ]
    ),
    VarFileInfo([VarStruct('Translation', [1033, 1200])])
  ]
)
'''
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(pe_content)
    return target_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TerriX Octuple Version Manager")
    parser.add_argument("--current", action="store_true", help="Print current octuple version string")
    parser.add_argument("--bump", action="store_true", help="Increment V8 revision tier (+0.0.0.0.0.0.0.1)")
    parser.add_argument("--generate-pe", action="store_true", help="Generate file_version_info.txt for PyInstaller")
    parser.add_argument("--set", type=str, help="Set explicit version string")
    
    args = parser.parse_args()
    
    if args.bump:
        new_ver = bump_patch()
        print(f"[+] Version bumped to: {new_ver}")
    elif args.generate_pe:
        path = generate_pe_version_info()
        print(f"[+] Generated Windows PE version file: {path}")
    elif args.set:
        data = load_version_data()
        data["version"] = args.set
        save_version_data(data)
        generate_pe_version_info()
        print(f"[+] Version set to: {args.set}")
    else:
        print(get_version_string())
