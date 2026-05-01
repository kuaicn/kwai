# 跨域浏览器

基于 PyQt6 WebEngine 的轻量级浏览器，**禁用同源策略 (CORS)**，允许跨域请求。

## 功能特性

- 禁用 Web 安全策略，允许跨域 AJAX/Fetch 请求
- 支持 http/https/file 协议
- 基本导航功能（前进/后退/刷新/主页）
- 地址栏自动补全协议
- JavaScript 控制台消息捕获

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行

```bash
python main.py
```

## 使用说明

1. 在地址栏输入网址（自动补全 https://）
2. 按 Enter 加载页面
3. 页面内的跨域请求将不再受 CORS 限制

## 注意事项

- 禁用 Web 安全仅用于开发调试目的
- 不要在生产环境或处理敏感数据时使用
- 某些网站可能有额外的安全措施
