# Canvas Academy / 画布学院

特工调酒训练系统 — 基于序列配方的交互式饮品调制 PWA。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 + Vite + Tailwind 4 |
| 后端 | Cloudflare Worker + D1 |
| 部署 | Cloudflare Pages |
| PWA | Service Worker + Manifest (可安装全屏) |

## 本地开发

```bash
npm install
npm run dev
```

Worker 本地调试：

```bash
npx wrangler dev worker/index.js
```

## 项目结构

```
src/App.jsx        # 单文件 SPA (终端→任务大厅→操作台→毕业)
public/assets/     # 饮品物料图标 (WebP)
worker/index.js    # Cloudflare Worker API
worker/schema.sql  # D1 数据库 Schema
```

## 管理后台

三击页面顶部状态灯解锁 DEBUG CONSOLE，可切换视图、一键通关、清缓存。

Agent 数据直接通过 Cloudflare Dashboard → D1 查看。
