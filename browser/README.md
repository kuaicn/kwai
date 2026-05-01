# 跨域浏览器

基于 PyQt6 WebEngine 的轻量级浏览器，**禁用同源策略 (CORS)**，允许跨域请求。

## 功能特性

- 禁用 Web 安全策略，允许跨域 AJAX/Fetch 请求
- 固定 URL: `https://kuaicn.github.io/kwai`
- 自动获取系统代理（支持 HTTP_PROXY 环境变量）
- 禁用导航快捷键（后退/前进/刷新/主页）
- 状态显示在窗口标题栏

## 快速开始

### 方式一：直接运行源码

```bash
pip install -r requirements.txt
python main.py
```

### 方式二：运行可执行文件

从 [GitHub Actions Artifacts](https://github.com/kuaicn/kwai/actions) 下载对应平台的可执行文件。

#### Windows
```bash
dist/windows/kwai-browser.exe
```

#### Linux
```bash
dist/linux/kwai-browser
```

#### macOS
```bash
open dist/mac/kwai-browser.app
```

## 代理设置

如果在中国大陆访问 GitHub Pages 需要代理：

```bash
# Windows PowerShell
$env:HTTP_PROXY="http://127.0.0.1:7890"
python main.py

# Linux/macOS
export HTTP_PROXY=http://127.0.0.1:7890
python main.py
```

## 打包

### 本地打包

```bash
# 打包当前平台
python build.py

# 打包指定平台
python build.py --platform windows
python build.py --platform linux
python build.py --platform mac

# 清理打包文件
python build.py --clean
```

### Docker 打包 (Linux)

```bash
cd browser
docker build -t kwai-browser-builder .
docker run -v $(pwd)/dist/linux:/app/dist/linux kwai-browser-builder
```

### GitHub Actions 自动打包

推送代码到 `main` 分支，或手动触发工作流：

```bash
git push origin main
```

然后在 GitHub Actions 页面下载打包好的可执行文件。

## 项目结构

```
browser/
├── main.py              # 浏览器主程序
├── requirements.txt     # Python 依赖
├── build.py            # 打包脚本
├── Dockerfile          # Docker 打包配置
├── README.md           # 说明文档
└── dist/               # 打包输出目录
    ├── windows/
    ├── linux/
    └── mac/
```

## 注意事项

- 禁用 Web 安全仅用于开发调试目的
- 不要在生产环境或处理敏感数据时使用
- 某些网站可能有额外的安全措施
