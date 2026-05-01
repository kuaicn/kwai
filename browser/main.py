#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
跨域浏览器 - 基于 PyQt6 WebEngine
固定 URL: https://kuaicn.github.io/kwai
禁用前进/后退/刷新/地址栏导航
"""

import sys
import os

# 在创建 QApplication 之前设置跨域相关环境变量和参数
os.environ['QTWEBENGINE_CHROMIUM_FLAGS'] = '--disable-web-security --disable-features=IsolateOrigins,site-per-process --disable-site-isolation-trials --allow-running-insecure-content --disable-features=BlockInsecurePrivateNetworkRequests'

from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEngineProfile, QWebEnginePage, QWebEngineSettings, QWebEngineCertificateError
from PyQt6.QtCore import QUrl, Qt
from PyQt6.QtNetwork import QNetworkProxy, QNetworkProxyFactory


FIXED_URL = "https://kuaicn.github.io/kwai"


def setup_proxy():
    """设置系统代理，支持环境变量和系统配置"""
    # 1. 尝试通过 Qt 自动检测系统代理配置
    QNetworkProxyFactory.setUseSystemConfiguration(True)
    proxy = QNetworkProxy.applicationProxy()
    
    # 2. 如果 Qt 未检测到，尝试从环境变量读取
    if proxy.type() == QNetworkProxy.ProxyType.NoProxy:
        env_vars = ['HTTP_PROXY', 'http_proxy', 'ALL_PROXY', 'all_proxy', 'HTTPS_PROXY', 'https_proxy']
        for var in env_vars:
            value = os.environ.get(var)
            if value:
                print(f"[代理] 从环境变量 {var} 检测到: {value}")
                # 解析代理地址 (格式: http://host:port 或 host:port)
                if value.startswith('http://') or value.startswith('https://'):
                    value = value.split('://', 1)[1]
                if ':' in value:
                    host, port_str = value.rsplit(':', 1)
                    try:
                        port = int(port_str)
                        proxy = QNetworkProxy(QNetworkProxy.ProxyType.HttpProxy, host, port)
                        QNetworkProxy.setApplicationProxy(proxy)
                        print(f"[代理] 已设置 HTTP 代理: {host}:{port}")
                        return proxy
                    except ValueError:
                        pass
    else:
        print(f"[代理] Qt 检测到系统代理: {proxy.hostName()}:{proxy.port()} (类型: {proxy.type().name})")
    
    if proxy.type() == QNetworkProxy.ProxyType.NoProxy:
        print("[代理] 未检测到代理")
        print("[提示] 如果在中国大陆访问 GitHub Pages 失败，请设置代理环境变量，例如：")
        print("       set HTTP_PROXY=http://127.0.0.1:7890")
    
    return proxy


class CORSWebPage(QWebEnginePage):
    """自定义 WebPage，允许跨域请求"""
    
    def __init__(self, profile, parent=None):
        super().__init__(profile, parent)
    
    def javaScriptConsoleMessage(self, level, message, lineNumber, sourceID):
        """捕获 JavaScript 控制台消息"""
        print(f"[JS Console] {message} (line {lineNumber}, {sourceID})")
    
    def acceptNavigationRequest(self, url, nav_type, is_main_frame):
        """拦截导航请求，允许固定 URL 及其重定向"""
        url_str = url.toString()
        # 允许固定 URL 和以它开头的 URL（处理重定向等情况）
        if url_str.startswith(FIXED_URL) or url_str == FIXED_URL:
            print(f"[导航] 允许: {url_str}")
            return super().acceptNavigationRequest(url, nav_type, is_main_frame)
        # 阻止所有其他导航
        print(f"[导航] 阻止: {url_str}")
        return False
    
    def javaScriptAlert(self, requestingUrl, msg):
        """处理 alert"""
        print(f"[JS Alert] {msg}")
    
    def javaScriptConfirm(self, requestingUrl, msg):
        """处理 confirm"""
        print(f"[JS Confirm] {msg}")
        return True
    
    def certificateError(self, error):
        """忽略 SSL 证书错误（开发调试用）"""
        print(f"[SSL] 忽略证书错误: {error.errorDescription()} (类型: {error.type().name})")
        return True


class CORBrowser(QMainWindow):
    """跨域浏览器主窗口 - 固定 URL，无导航控件"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle(f"跨域浏览器 - {FIXED_URL}")
        self.setGeometry(100, 100, 1280, 800)
        
        # 创建中央部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # 创建 Web 视图
        self.create_webview(layout)
        
        # 加载固定 URL
        print(f"[加载] 正在加载: {FIXED_URL}")
        self.browser.setUrl(QUrl(FIXED_URL))
    
    def create_webview(self, layout):
        """创建 Web 视图（禁用 CORS）"""
        # 创建自定义 profile，禁用安全策略（保存为实例变量避免提前释放）
        self.profile = QWebEngineProfile("cors_disabled_profile", self)
        
        # 配置 WebEngine 设置
        settings = self.profile.settings()
        settings.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessFileUrls, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.AllowRunningInsecureContent, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.JavascriptEnabled, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.JavascriptCanAccessClipboard, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.JavascriptCanPaste, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.PluginsEnabled, True)
        
        # 创建自定义页面
        self.page = CORSWebPage(self.profile, self)
        
        # 创建 WebView
        self.browser = QWebEngineView()
        self.browser.setPage(self.page)
        self.browser.setContextMenuPolicy(Qt.ContextMenuPolicy.NoContextMenu)
        
        # 连接信号
        self.browser.loadStarted.connect(self.on_load_started)
        self.browser.loadProgress.connect(self.on_load_progress)
        self.browser.loadFinished.connect(self.on_load_finished)
        
        layout.addWidget(self.browser, 1)
    
    def keyPressEvent(self, event):
        """禁用后退/前进/刷新/主页等导航快捷键"""
        key = event.key()
        modifiers = event.modifiers()
        
        # 禁用 Alt+Left (后退)
        if key == Qt.Key.Key_Left and modifiers == Qt.KeyboardModifier.AltModifier:
            print("[快捷键] 已禁用: Alt+Left (后退)")
            return
        
        # 禁用 Alt+Right (前进)
        if key == Qt.Key.Key_Right and modifiers == Qt.KeyboardModifier.AltModifier:
            print("[快捷键] 已禁用: Alt+Right (前进)")
            return
        
        # 禁用 Alt+Home (主页)
        if key == Qt.Key.Key_Home and modifiers == Qt.KeyboardModifier.AltModifier:
            print("[快捷键] 已禁用: Alt+Home (主页)")
            return
        
        # 禁用 F5 (刷新)
        if key == Qt.Key.Key_F5:
            print("[快捷键] 已禁用: F5 (刷新)")
            return
        
        # 禁用 Ctrl+R (刷新)
        if key == Qt.Key.Key_R and modifiers == Qt.KeyboardModifier.ControlModifier:
            print("[快捷键] 已禁用: Ctrl+R (刷新)")
            return
        
        # 禁用 Ctrl+Shift+R (强制刷新)
        if key == Qt.Key.Key_R and modifiers == (Qt.KeyboardModifier.ControlModifier | Qt.KeyboardModifier.ShiftModifier):
            print("[快捷键] 已禁用: Ctrl+Shift+R (强制刷新)")
            return
        
        # 其他按键正常处理
        super().keyPressEvent(event)
    
    def closeEvent(self, event):
        """关闭窗口时按正确顺序释放资源"""
        self.browser.setPage(None)
        self.page.deleteLater()
        self.browser.deleteLater()
        event.accept()
    
    def on_load_started(self):
        """加载开始"""
        self.setWindowTitle("加载中...")
        print("[状态] 加载开始")
    
    def on_load_progress(self, progress):
        """加载进度"""
        self.setWindowTitle(f"加载中... {progress}%")
    
    def on_load_finished(self, success):
        """加载完成"""
        if success:
            self.setWindowTitle(f"已加载: {FIXED_URL}")
            print("[状态] 加载完成")
        else:
            self.setWindowTitle("加载失败，请检查网络连接和代理设置")
            print("[状态] 加载失败")
            print("[提示] 如果在中国大陆，请确保已设置代理：")
            print("       set HTTP_PROXY=http://127.0.0.1:7890")
            print("       将 7890 替换为你的代理端口（Clash 默认 7890，V2RayN 默认 10809）")


def main():
    # 设置命令行参数以禁用 Web 安全
    sys.argv.append('--disable-web-security')
    sys.argv.append('--disable-features=IsolateOrigins,site-per-process')
    sys.argv.append('--allow-running-insecure-content')
    
    app = QApplication(sys.argv)
    app.setApplicationName("跨域浏览器")
    app.setApplicationVersion("1.0.0")
    
    # 设置系统代理
    setup_proxy()
    
    window = CORBrowser()
    window.show()
    
    # 使用 exec() 而不是 sys.exit()，确保退出时正确清理资源
    ret = app.exec()
    # 清理资源，避免 profile 释放警告
    del window
    sys.exit(ret)


if __name__ == '__main__':
    main()
