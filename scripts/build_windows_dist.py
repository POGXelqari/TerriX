#!/usr/bin/env python3
"""
TerriX Windows Distribution Compiler
====================================
Compiles and packages:
1. terrix.exe (Main application binary with terrix-logo.ico)
2. TerriX_Setup.exe (Interactive Windows setup installer)
3. TerriX_Executor_v{VER}_Win64.zip (Release distribution package)
Automatically increments V8 octuple version (+0.0.0.0.0.0.0.1) on build.
"""

import os
import sys
import shutil
import zipfile
import subprocess
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
DIST_DIR = os.path.join(BASE_DIR, "dist")
BUILD_DIR = os.path.join(BASE_DIR, "build")

sys.path.insert(0, SCRIPTS_DIR)
import version_manager

def main():
    print("=" * 65)
    print("TerriX Windows Software Compilation Pipeline")
    print("=" * 65)

    # 0. Clean any running instances holding file locks
    try:
        subprocess.run(["taskkill", "/f", "/im", "terrix.exe"], capture_output=True)
        subprocess.run(["taskkill", "/f", "/im", "TerriX_Setup.exe"], capture_output=True)
        time.sleep(0.5)
    except Exception:
        pass

    # Ensure previous output executables are deleted
    os.makedirs(DIST_DIR, exist_ok=True)
    for fname in ["terrix.exe", "TerriX_Setup.exe"]:
        p = os.path.join(DIST_DIR, fname)
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                time.sleep(1.0)
                try:
                    os.remove(p)
                except Exception:
                    pass

    # 1. Version Bump
    print("[1/5] Incrementing octuple build version (+0.0.0.0.0.0.0.1)...")
    new_version = version_manager.bump_patch()
    print(f"      -> Active Target Build: v{new_version}")

    # 2. Verify Visual Assets
    print("[2/5] Validating brand visual assets...")
    ico_path = os.path.join(BASE_DIR, "terrix-logo.ico")
    png_path = os.path.join(BASE_DIR, "terrix-logo.png")
    if not os.path.exists(ico_path) or not os.path.exists(png_path):
        print("[!] Error: terrix-logo.ico or terrix-logo.png missing!")
        sys.exit(1)
    print(f"      -> terrix-logo.ico ({os.path.getsize(ico_path)} bytes)")
    print(f"      -> terrix-logo.png ({os.path.getsize(png_path)} bytes)")

    # 3. Generate Windows PE Version Info
    print("[3/5] Generating Windows PE binary version metadata...")
    pe_file = version_manager.generate_pe_version_info()
    print(f"      -> Output: {pe_file}")

    # 4. Compile Application (terrix.exe)
    print("[4/5] Compiling primary binary (terrix.exe)...")
    app_spec = os.path.join(BASE_DIR, "TerriX_App.spec")
    cmd_app = [sys.executable, "-m", "PyInstaller", "--clean", "-y", app_spec]
    
    t0 = time.time()
    res = subprocess.run(cmd_app, cwd=BASE_DIR)
    if res.returncode != 0:
        print("[!] Error compiling terrix.exe!")
        sys.exit(1)
    print(f"      -> terrix.exe compiled in {round(time.time() - t0, 1)}s")

    # 5. Compile Setup Installer (TerriX_Setup.exe)
    print("[5/5] Compiling Windows Setup Installer (TerriX_Setup.exe)...")
    setup_spec = os.path.join(BASE_DIR, "TerriX_Setup.spec")
    cmd_setup = [sys.executable, "-m", "PyInstaller", "--clean", "-y", setup_spec]
    
    t0 = time.time()
    res = subprocess.run(cmd_setup, cwd=BASE_DIR)
    if res.returncode != 0:
        print("[!] Error compiling TerriX_Setup.exe!")
        sys.exit(1)
    print(f"      -> TerriX_Setup.exe compiled in {round(time.time() - t0, 1)}s")

    # Create Distribution Zip
    zip_name = f"TerriX_Executor_v{new_version}_Win64.zip"
    zip_path = os.path.join(DIST_DIR, zip_name)
    print(f"[*] Packaging release bundle: {zip_name}...")
    
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        terrix_exe = os.path.join(DIST_DIR, "terrix.exe")
        setup_exe = os.path.join(DIST_DIR, "TerriX_Setup.exe")
        if os.path.exists(terrix_exe):
            z.write(terrix_exe, "terrix.exe")
        if os.path.exists(setup_exe):
            z.write(setup_exe, f"TerriX_Setup_v{new_version}.exe")
        if os.path.exists(os.path.join(BASE_DIR, "README.md")):
            z.write(os.path.join(BASE_DIR, "README.md"), "README.md")

    print("\n" + "=" * 65)
    print("Compilation Complete!")
    print(f"Product Version: v{new_version}")
    if os.path.exists(os.path.join(DIST_DIR, "terrix.exe")):
        print(f"Binary 1: {os.path.join(DIST_DIR, 'terrix.exe')} ({round(os.path.getsize(os.path.join(DIST_DIR, 'terrix.exe')) / (1024*1024), 2)} MB)")
    if os.path.exists(os.path.join(DIST_DIR, "TerriX_Setup.exe")):
        print(f"Binary 2: {os.path.join(DIST_DIR, 'TerriX_Setup.exe')} ({round(os.path.getsize(os.path.join(DIST_DIR, 'TerriX_Setup.exe')) / (1024*1024), 2)} MB)")
    if os.path.exists(zip_path):
        print(f"Release Archive: {zip_path} ({round(os.path.getsize(zip_path) / (1024*1024), 2)} MB)")
    print("=" * 65)

if __name__ == "__main__":
    main()
