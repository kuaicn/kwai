#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
打包脚本 - 为各平台生成可执行文件
支持: Windows (.exe), Linux, macOS (.app)
"""

import sys
import os
import shutil
import platform
import subprocess


def get_platform():
    """获取当前平台"""
    system = platform.system().lower()
    if system == 'windows':
        return 'windows'
    elif system == 'linux':
        return 'linux'
    elif system == 'darwin':
        return 'mac'
    return system


def clean_dist():
    """清理打包目录"""
    dirs = ['build', 'dist']
    for d in dirs:
        if os.path.exists(d):
            print(f"[清理] 删除 {d}/")
            shutil.rmtree(d)
    # 删除 .spec 文件
    for f in os.listdir('.'):
        if f.endswith('.spec'):
            print(f"[清理] 删除 {f}")
            os.remove(f)


def build_windows():
    """打包 Windows 版本 (.exe)"""
    print("[打包] Windows 版本...")
    
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
        print("[成功] Windows 可执行文件已生成: dist/windows/kwai-browser.exe")
        # 创建启动脚本
        with open('dist/windows/start.bat', 'w', encoding='utf-8') as f:
            f.write('@echo off\n')
            f.write('set HTTP_PROXY=%HTTP_PROXY%\n')
            f.write('kwai-browser.exe\n')
            f.write('pause\n')
        print("[创建] 启动脚本: dist/windows/start.bat")
    else:
        print("[失败] Windows 打包失败")
        return False
    return True


def build_linux():
    """打包 Linux 版本"""
    print("[打包] Linux 版本...")
    
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
        print("[成功] Linux 可执行文件已生成: dist/linux/kwai-browser")
        # 创建启动脚本
        with open('dist/linux/start.sh', 'w', encoding='utf-8') as f:
            f.write('#!/bin/bash\n')
            f.write('export HTTP_PROXY="${HTTP_PROXY:-}"\n')
            f.write('./kwai-browser\n')
        os.chmod('dist/linux/start.sh', 0o755)
        print("[创建] 启动脚本: dist/linux/start.sh")
    else:
        print("[失败] Linux 打包失败")
        return False
    return True


def build_mac():
    """打包 macOS 版本 (.app)"""
    print("[打包] macOS 版本...")
    
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
        print("[成功] macOS 应用已生成: dist/mac/kwai-browser.app")
        # 创建启动脚本
        with open('dist/mac/start.sh', 'w', encoding='utf-8') as f:
            f.write('#!/bin/bash\n')
            f.write('export HTTP_PROXY="${HTTP_PROXY:-}"\n')
            f.write('open kwai-browser.app\n')
        os.chmod('dist/mac/start.sh', 0o755)
        print("[创建] 启动脚本: dist/mac/start.sh")
    else:
        print("[失败] macOS 打包失败")
        return False
    return True


def print_cross_compile_info():
    """输出交叉编译说明"""
    print("\n" + "="*60)
    print("交叉编译说明")
    print("="*60)
    print("""
PyInstaller 不支持真正的交叉编译。要为其他平台打包：

1. Windows (当前平台):
   已在当前系统生成 dist/windows/kwai-browser.exe

2. Linux:
   在 Linux 系统上运行:
   python build.py --platform linux
   
   或使用 Docker:
   docker run -v $(pwd):/app -w /app python:3.10 bash -c "
     pip install PyQt6 PyQt6-WebEngine pyinstaller &&
     python build.py --platform linux
   "

3. macOS:
   在 macOS 系统上运行:
   python build.py --platform mac
   
   或使用 GitHub Actions 在 macOS runner 上自动打包

替代方案：使用 GitHub Actions 自动化打包
创建 .github/workflows/build.yml 实现自动打包所有平台
""")


def main():
    import argparse
    parser = argparse.ArgumentParser(description='打包跨域浏览器')
    parser.add_argument('--platform', choices=['windows', 'linux', 'mac', 'all'],
                       default=None, help='目标平台 (默认: 当前平台)')
    parser.add_argument('--clean', action='store_true', help='清理打包文件')
    args = parser.parse_args()
    
    if args.clean:
        clean_dist()
        return
    
    current = get_platform()
    target = args.platform or current
    
    print(f"[信息] 当前平台: {current}")
    print(f"[信息] 目标平台: {target}")
    
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
            print("[警告] 当前不是 Windows 系统，可能无法正确打包 Windows 版本")
            print("[提示] 建议在 Windows 系统上运行此命令")
        build_windows()
    elif target == 'linux':
        if current != 'linux':
            print("[警告] 当前不是 Linux 系统，可能无法正确打包 Linux 版本")
            print("[提示] 建议在 Linux 系统上运行此命令")
        build_linux()
    elif target == 'mac':
        if current != 'darwin':
            print("[警告] 当前不是 macOS 系统，无法打包 macOS 版本")
            print("[提示] 必须在 macOS 系统上运行此命令")
        else:
            build_mac()
    
    print("\n[完成] 打包流程结束")
    print_cross_compile_info()


if __name__ == '__main__':
    main()
