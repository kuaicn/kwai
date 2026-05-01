#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build script - Generate executables for all platforms
Supports: Windows (.exe), Linux, macOS (.app)
"""

import sys
import os
import shutil
import platform
import subprocess


def get_platform():
    """Get current platform"""
    system = platform.system().lower()
    if system == 'windows':
        return 'windows'
    elif system == 'linux':
        return 'linux'
    elif system == 'darwin':
        return 'mac'
    return system


def clean_dist():
    """Clean build directories"""
    dirs = ['build', 'dist']
    for d in dirs:
        if os.path.exists(d):
            print(f"[Clean] Removing {d}/")
            shutil.rmtree(d)
    for f in os.listdir('.'):
        if f.endswith('.spec'):
            print(f"[Clean] Removing {f}")
            os.remove(f)


def build_windows():
    """Build Windows executable (.exe)"""
    print("[Build] Windows version...")
    
    cmd = [
        sys.executable, '-m', 'PyInstaller',
        '--name', 'kwai-browser',
        '--onefile',
        '--windowed',
        '--icon', 'NONE',
        '--distpath', 'dist/windows',
        '--workpath', 'build/windows',
        '--specpath', '.',
        '--add-data', 'README.md;.',
        'main.py'
    ]
    
    result = subprocess.run(cmd, capture_output=False, text=True)
    
    if result.returncode == 0:
        print("[OK] Windows executable: dist/windows/kwai-browser.exe")
        with open('dist/windows/start.bat', 'w', encoding='utf-8') as f:
            f.write('@echo off\n')
            f.write('set HTTP_PROXY=%HTTP_PROXY%\n')
            f.write('kwai-browser.exe\n')
            f.write('pause\n')
        print("[OK] Startup script: dist/windows/start.bat")
        return True
    else:
        print("[FAIL] Windows build failed")
        return False


def build_linux():
    """Build Linux executable"""
    print("[Build] Linux version...")
    
    cmd = [
        sys.executable, '-m', 'PyInstaller',
        '--name', 'kwai-browser',
        '--onefile',
        '--windowed',
        '--distpath', 'dist/linux',
        '--workpath', 'build/linux',
        '--specpath', '.',
        '--add-data', 'README.md:.',
        'main.py'
    ]
    
    result = subprocess.run(cmd, capture_output=False, text=True)
    
    if result.returncode == 0:
        print("[OK] Linux executable: dist/linux/kwai-browser")
        with open('dist/linux/start.sh', 'w', encoding='utf-8') as f:
            f.write('#!/bin/bash\n')
            f.write('export HTTP_PROXY="${HTTP_PROXY:-}"\n')
            f.write('./kwai-browser\n')
        os.chmod('dist/linux/start.sh', 0o755)
        print("[OK] Startup script: dist/linux/start.sh")
        return True
    else:
        print("[FAIL] Linux build failed")
        return False


def build_mac():
    """Build macOS app"""
    print("[Build] macOS version...")
    
    cmd = [
        sys.executable, '-m', 'PyInstaller',
        '--name', 'kwai-browser',
        '--windowed',
        '--distpath', 'dist/mac',
        '--workpath', 'build/mac',
        '--specpath', '.',
        '--add-data', 'README.md:.',
        'main.py'
    ]
    
    result = subprocess.run(cmd, capture_output=False, text=True)
    
    if result.returncode == 0:
        print("[OK] macOS app: dist/mac/kwai-browser.app")
        with open('dist/mac/start.sh', 'w', encoding='utf-8') as f:
            f.write('#!/bin/bash\n')
            f.write('export HTTP_PROXY="${HTTP_PROXY:-}"\n')
            f.write('open kwai-browser.app\n')
        os.chmod('dist/mac/start.sh', 0o755)
        print("[OK] Startup script: dist/mac/start.sh")
        return True
    else:
        print("[FAIL] macOS build failed")
        return False


def print_cross_compile_info():
    """Print cross-compile info"""
    print("\n" + "="*60)
    print("Cross-Compile Info")
    print("="*60)
    print("""
PyInstaller does not support true cross-compilation.

1. Windows (current):
   Generated: dist/windows/kwai-browser.exe

2. Linux:
   Run on Linux: python build.py --platform linux
   Or use Docker: docker build -t kwai-browser .

3. macOS:
   Run on macOS: python build.py --platform mac
   Or use GitHub Actions with macOS runner
""")


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Build CORS Browser')
    parser.add_argument('--platform', choices=['windows', 'linux', 'mac', 'all'],
                       default=None, help='Target platform (default: current)')
    parser.add_argument('--clean', action='store_true', help='Clean build files')
    args = parser.parse_args()
    
    if args.clean:
        clean_dist()
        return
    
    current = get_platform()
    target = args.platform or current
    
    print(f"[Info] Current platform: {current}")
    print(f"[Info] Target platform: {target}")
    
    if target == 'all':
        if current == 'windows':
            build_windows()
            print_cross_compile_info()
        elif current == 'linux':
            build_linux()
            print_cross_compile_info()
        elif current == 'mac':
            build_mac()
            print_cross_compile_info()
    elif target == 'windows':
        if current != 'windows':
            print("[Warn] Not on Windows, build may fail")
        build_windows()
    elif target == 'linux':
        if current != 'linux':
            print("[Warn] Not on Linux, build may fail")
        build_linux()
    elif target == 'mac':
        if current != 'darwin':
            print("[Warn] Not on macOS, build will fail")
        else:
            build_mac()
    
    print("\n[Done] Build complete")
    print_cross_compile_info()


if __name__ == '__main__':
    main()
