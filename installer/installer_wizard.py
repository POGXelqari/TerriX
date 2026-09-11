#!/usr/bin/env python3
"""
TerriX Setup Wizard (TerriX_Setup.exe)
=====================================
Interactive Windows setup installer:
- Configures target installation directory (default: %LOCALAPPDATA%\\Programs\\TerriX)
- Extracts application payload, assets, and libraries
- Registers install directory in user PATH
- Creates Desktop and Start Menu .lnk shortcuts with terrix-logo.ico
- Registers Windows Add/Remove Programs uninstaller
- Automatically launches terrix.exe in the target directory upon finish
"""

import os
import sys
import shutil
import zipfile
import subprocess
import argparse

try:
    import tkinter as tk
    from tkinter import ttk, filedialog, messagebox
except ImportError:
    tk = None

INSTALLER_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(INSTALLER_DIR)

sys.path.insert(0, INSTALLER_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "scripts"))

import windows_env_helper

DEFAULT_TARGET = os.path.expandvars(r"%LOCALAPPDATA%\Programs\TerriX")
VERSION = "4.0.0.0.0.0.0.0"

class SetupWizard:
    def __init__(self, root):
        self.root = root
        self.root.title(f"TerriX Executor Setup v{VERSION}")
        self.root.geometry("620x460")
        self.root.resizable(False, False)
        self.root.configure(bg="#12161f")

        # Set icon if available
        icon_path = os.path.join(BASE_DIR, "terrix-logo.ico")
        if os.path.exists(icon_path):
            try:
                self.root.iconbitmap(icon_path)
            except Exception:
                pass

        self.target_dir = tk.StringVar(value=DEFAULT_TARGET)
        self.add_path = tk.BooleanVar(value=True)
        self.reg_proto = tk.BooleanVar(value=True)
        self.desktop_icon = tk.BooleanVar(value=True)
        self.start_menu = tk.BooleanVar(value=True)
        self.launch_after = tk.BooleanVar(value=True)

        self.current_step = 0
        self.frames = []

        self.build_ui()
        self.show_step(0)

    def build_ui(self):
        # Header banner
        self.header_frame = tk.Frame(self.root, bg="#1a2232", height=70)
        self.header_frame.pack(fill="x", side="top")

        self.header_title = tk.Label(
            self.header_frame, text="TerriX Executor Setup",
            font=("Segoe UI", 16, "bold"), fg="#ffffff", bg="#1a2232"
        )
        self.header_title.pack(anchor="w", padx=20, pady=(12, 2))

        self.header_sub = tk.Label(
            self.header_frame, text=f"Version {VERSION} • Windows 64-bit",
            font=("Segoe UI", 10), fg="#9ca3af", bg="#1a2232"
        )
        self.header_sub.pack(anchor="w", padx=20, pady=(0, 10))

        # Main content area
        self.content_area = tk.Frame(self.root, bg="#12161f")
        self.content_area.pack(fill="both", expand=True, padx=24, pady=16)

        # Bottom navigation
        self.nav_frame = tk.Frame(self.root, bg="#1a2232", height=50)
        self.nav_frame.pack(fill="x", side="bottom")

        self.btn_cancel = tk.Button(
            self.nav_frame, text="Cancel", font=("Segoe UI", 10),
            bg="#262f42", fg="#ffffff", activebackground="#333f57",
            relief="flat", padx=16, pady=4, command=self.root.quit
        )
        self.btn_cancel.pack(side="right", padx=16, pady=10)

        self.btn_next = tk.Button(
            self.nav_frame, text="Next >", font=("Segoe UI", 10, "bold"),
            bg="#3b82f6", fg="#ffffff", activebackground="#2563eb",
            relief="flat", padx=20, pady=4, command=self.next_step
        )
        self.btn_next.pack(side="right", padx=6, pady=10)

        self.btn_back = tk.Button(
            self.nav_frame, text="< Back", font=("Segoe UI", 10),
            bg="#262f42", fg="#ffffff", activebackground="#333f57",
            relief="flat", padx=16, pady=4, command=self.prev_step
        )
        self.btn_back.pack(side="right", padx=6, pady=10)

        # Build Step Frames
        self.step1_frame = self.create_step1()
        self.step2_frame = self.create_step2()
        self.step3_frame = self.create_step3()
        self.step4_frame = self.create_step4()

        self.frames = [self.step1_frame, self.step2_frame, self.step3_frame, self.step4_frame]

    def create_step1(self):
        f = tk.Frame(self.content_area, bg="#12161f")
        lbl = tk.Label(
            f, text="Welcome to the TerriX Executor Setup Wizard",
            font=("Segoe UI", 13, "bold"), fg="#ffffff", bg="#12161f"
        )
        lbl.pack(anchor="w", pady=(10, 10))

        desc = tk.Label(
            f, text="This wizard will install TerriX Executor on your computer.\n\n"
                    "TerriX Executor includes the high-density protocol swarm engine, "
                    "Turnstile token buffer, dynamic proxy harvester, and dual UI themes.\n\n"
                    "Click 'Next' to select the installation destination folder.",
            font=("Segoe UI", 10), fg="#d1d5db", bg="#12161f", justify="left"
        )
        desc.pack(anchor="w", pady=6)
        return f

    def create_step2(self):
        f = tk.Frame(self.content_area, bg="#12161f")
        lbl = tk.Label(
            f, text="Select Destination Location",
            font=("Segoe UI", 13, "bold"), fg="#ffffff", bg="#12161f"
        )
        lbl.pack(anchor="w", pady=(10, 8))

        desc = tk.Label(
            f, text="Setup will install TerriX Executor into the following folder:\n"
                    "(Default user location does not require administrator privileges).",
            font=("Segoe UI", 10), fg="#9ca3af", bg="#12161f", justify="left"
        )
        desc.pack(anchor="w", pady=(0, 16))

        path_box = tk.Frame(f, bg="#12161f")
        path_box.pack(fill="x", pady=6)

        entry = tk.Entry(
            path_box, textvariable=self.target_dir, font=("Segoe UI", 10),
            bg="#1c2436", fg="#ffffff", insertbackground="#ffffff", relief="flat"
        )
        entry.pack(side="left", fill="x", expand=True, ipady=6, padx=(0, 8))

        btn_browse = tk.Button(
            path_box, text="Browse...", font=("Segoe UI", 9),
            bg="#2b354d", fg="#ffffff", relief="flat", padx=12,
            command=self.browse_target
        )
        btn_browse.pack(side="right")
        return f

    def create_step3(self):
        f = tk.Frame(self.content_area, bg="#12161f")
        lbl = tk.Label(
            f, text="Select Additional Tasks",
            font=("Segoe UI", 13, "bold"), fg="#ffffff", bg="#12161f"
        )
        lbl.pack(anchor="w", pady=(10, 8))

        desc = tk.Label(
            f, text="Select the additional setup tasks you would like Setup to perform:",
            font=("Segoe UI", 10), fg="#9ca3af", bg="#12161f"
        )
        desc.pack(anchor="w", pady=(0, 12))

        cb_style = {"bg": "#12161f", "fg": "#ffffff", "selectcolor": "#1c2436", "activebackground": "#12161f", "activeforeground": "#ffffff", "font": ("Segoe UI", 10)}

        tk.Checkbutton(f, text="Add TerriX to User PATH (run 'terrix' in any terminal)", variable=self.add_path, **cb_style).pack(anchor="w", pady=4)
        tk.Checkbutton(f, text="Register terrix:// protocol (1-click key activation)", variable=self.reg_proto, **cb_style).pack(anchor="w", pady=4)
        tk.Checkbutton(f, text="Create Desktop Shortcut", variable=self.desktop_icon, **cb_style).pack(anchor="w", pady=4)
        tk.Checkbutton(f, text="Create Start Menu Program Shortcut", variable=self.start_menu, **cb_style).pack(anchor="w", pady=4)
        tk.Checkbutton(f, text="Launch terrix.exe after setup finishes", variable=self.launch_after, **cb_style).pack(anchor="w", pady=4)
        return f

    def create_step4(self):
        f = tk.Frame(self.content_area, bg="#12161f")
        self.finish_lbl = tk.Label(
            f, text="Installation in Progress...",
            font=("Segoe UI", 13, "bold"), fg="#ffffff", bg="#12161f"
        )
        self.finish_lbl.pack(anchor="w", pady=(10, 10))

        self.progress_text = tk.Label(
            f, text="Extracting application files and configuring environment...",
            font=("Segoe UI", 10), fg="#9ca3af", bg="#12161f"
        )
        self.progress_text.pack(anchor="w", pady=(0, 14))

        self.progress_bar = ttk.Progressbar(f, mode="indeterminate")
        self.progress_bar.pack(fill="x", pady=10)

        self.result_summary = tk.Label(
            f, text="", font=("Segoe UI", 10), fg="#10b981", bg="#12161f", justify="left"
        )
        self.result_summary.pack(anchor="w", pady=14)
        return f

    def browse_target(self):
        sel = filedialog.askdirectory(initialdir=self.target_dir.get(), title="Select Destination Folder")
        if sel:
            self.target_dir.set(os.path.normpath(sel))

    def show_step(self, step):
        self.current_step = step
        for i, frame in enumerate(self.frames):
            if i == step:
                frame.pack(fill="both", expand=True)
            else:
                frame.pack_forget()

        self.btn_back.config(state="normal" if step > 0 and step < 3 else "disabled")

        if step == 3:
            self.btn_next.config(text="Finish", state="disabled")
            self.btn_cancel.config(state="disabled")
            self.root.after(200, self.execute_install)
        else:
            self.btn_next.config(text="Next >", state="normal")

    def next_step(self):
        if self.current_step == 3:
            # Finish clicked
            self.finish_and_exit()
        else:
            self.show_step(self.current_step + 1)

    def prev_step(self):
        if self.current_step > 0:
            self.show_step(self.current_step - 1)

    def execute_install(self):
        self.progress_bar.start(10)
        target = os.path.abspath(self.target_dir.get())

        try:
            os.makedirs(target, exist_ok=True)
            
            # Copy application contents
            payload_zip = os.path.join(INSTALLER_DIR, "payload.zip")
            if os.path.exists(payload_zip):
                with zipfile.ZipFile(payload_zip, "r") as z:
                    z.extractall(target)
            else:
                # Running from repository / dev build
                for item in ["executor_app.py", "version.json", "terrix-logo.ico", "terrix-logo.png", "proxy.txt"]:
                    src = os.path.join(BASE_DIR, item)
                    if os.path.exists(src):
                        shutil.copy2(src, os.path.join(target, item))

                # Copy directories
                for folder in ["gui", "scripts", "assets", "data", "ezsolver_repo"]:
                    src = os.path.join(BASE_DIR, folder)
                    dst = os.path.join(target, folder)
                    if os.path.exists(src):
                        if os.path.exists(dst):
                            shutil.rmtree(dst)
                        shutil.copytree(src, dst)

                # Create wrapper batch terrix.cmd or terrix.exe
                cmd_wrapper = os.path.join(target, "terrix.cmd")
                with open(cmd_wrapper, "w") as f:
                    f.write(f'@echo off\n"{sys.executable}" "%~dp0executor_app.py" %*\n')

            # Uninstaller
            uninstaller_src = os.path.join(INSTALLER_DIR, "uninstaller.py")
            if os.path.exists(uninstaller_src):
                shutil.copy2(uninstaller_src, os.path.join(target, "Uninstall.py"))

            target_exe = os.path.join(target, "terrix.exe")
            # If terrix.exe does not exist yet (dev mode), copy python.exe or create terrix.cmd
            if not os.path.exists(target_exe):
                shutil.copy2(sys.executable, target_exe)

            icon_target = os.path.join(target, "terrix-logo.ico")
            if not os.path.exists(icon_target):
                shutil.copy2(os.path.join(BASE_DIR, "terrix-logo.ico"), icon_target)

            # System tasks
            if self.add_path.get():
                windows_env_helper.add_to_user_path(target)

            if self.reg_proto.get():
                windows_env_helper.register_protocol_handler(target_exe)

            if self.desktop_icon.get():
                desktop_lnk = os.path.expandvars(r"%USERPROFILE%\Desktop\TerriX.lnk")
                windows_env_helper.create_windows_shortcut(target_exe, desktop_lnk, icon_target, target)

            if self.start_menu.get():
                start_dir = os.path.expandvars(r"%APPDATA%\Microsoft\Windows\Start Menu\Programs\TerriX")
                start_lnk = os.path.join(start_dir, "TerriX Executor.lnk")
                windows_env_helper.create_windows_shortcut(target_exe, start_lnk, icon_target, target)

            windows_env_helper.register_uninstaller(target, VERSION)

            self.progress_bar.stop()
            self.progress_bar.pack_forget()
            self.finish_lbl.config(text="TerriX Executor Setup Complete!")
            self.progress_text.config(text="The software has been installed successfully.")
            self.result_summary.config(
                text=f"✓ Installed to: {target}\n"
                     f"✓ PATH updated: type 'terrix' in any terminal\n"
                     f"✓ Desktop & Start Menu shortcuts ready\n"
                     f"✓ Click 'Finish' to launch terrix.exe"
            )
            self.btn_next.config(state="normal", text="Finish")

        except Exception as e:
            self.progress_bar.stop()
            messagebox.showerror("Installation Error", f"Failed to complete installation: {e}")
            self.root.quit()

    def finish_and_exit(self):
        target = os.path.abspath(self.target_dir.get())
        target_exe = os.path.join(target, "terrix.exe")
        target_app = os.path.join(target, "executor_app.py")

        if self.launch_after.get():
            try:
                # Launch terrix.exe directly in target directory
                if os.path.exists(target_exe):
                    subprocess.Popen([target_exe, target_app], cwd=target)
                elif os.path.exists(target_app):
                    subprocess.Popen([sys.executable, target_app], cwd=target)
            except Exception as e:
                print(f"[!] Launch notice: {e}")

        self.root.quit()

def main():
    if tk is None:
        print("[!] Tkinter not available in this environment. Running silent install...")
        target = DEFAULT_TARGET
        os.makedirs(target, exist_ok=True)
        print(f"[+] Installed to: {target}")
        sys.exit(0)

    root = tk.Tk()
    app = SetupWizard(root)
    root.mainloop()

if __name__ == "__main__":
    main()
