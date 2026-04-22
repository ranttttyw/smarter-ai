# Starry · AI 星球漫游 — 部署指南

## 已完成的部署准备

代码已经做了以下修改，可以直接部署：

1. **前端 API 路径改为相对路径** — `fetch('/api/compare')` 代替 `fetch('http://localhost:3001/api/compare')`
2. **后端新增静态文件托管** — Express 同时 serve 前端 HTML，前后端合并为一个服务
3. **.env 已在 .gitignore 中** — API key 不会提交到 GitHub

---

## 方案一：Railway 一键部署（推荐，最简单）

### 第 1 步：推送代码到 GitHub

```bash
cd /你的项目路径/smarter-ai
git add -A
git commit -m "feat: prepare for deployment - relative API paths + static serving"
git push origin main
```

### 第 2 步：在 Railway 创建项目

1. 打开 [railway.app](https://railway.app)，用 GitHub 登录
2. 点击 **New Project → Deploy from GitHub repo**
3. 选择你的 `smarter-ai` 仓库
4. Railway 会自动检测到 Node.js 项目

### 第 3 步：配置构建设置

在 Railway 的 **Settings** 中设置：

| 设置项 | 值 |
|--------|-----|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### 第 4 步：配置环境变量

在 Railway 的 **Variables** 面板中添加：

```
OPENAI_API_KEY=sk-proj-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GEMINI_API_KEY=AIzaSyxxx
DEEPSEEK_API_KEY=sk-xxx
ZHIPU_API_KEY=xxx
PORT=3001
```

> ⚠️ 不要填 PORT — Railway 会自动分配端口。我们的代码 `process.env.PORT || 3001` 会自动使用 Railway 分配的端口。

实际操作时**去掉 PORT=3001 这一行**，Railway 会自动注入。

### 第 5 步：部署完成

Railway 会自动构建并部署。完成后会给你一个 URL，类似：
```
https://starry-ai-production.up.railway.app
```

打开这个 URL 就能看到 Starry 了！

---

## 方案二：分离部署（前端 Vercel + 后端 Railway）

如果你想前端和后端分开部署（比如前端想用自定义域名）：

### 后端：Railway（同方案一）

按上面的步骤部署后端，拿到后端 URL。

### 前端：Vercel

1. 把前端的 API 路径改为后端完整 URL：
   ```javascript
   // frontend/public/index.html 中修改
   const API_BASE = 'https://你的railway地址.up.railway.app';
   fetch(`${API_BASE}/api/compare`, { ... })
   fetch(`${API_BASE}/api/chat`, { ... })
   ```

2. 在 Vercel 部署：
   ```bash
   cd frontend/public
   npx vercel --prod
   ```

3. 后端 CORS 需要允许你的 Vercel 域名：
   ```javascript
   // backend/src/index.js
   app.use(cors({ origin: 'https://你的vercel域名.vercel.app' }));
   ```

---

## 方案三：Render.com（免费替代）

1. 打开 [render.com](https://render.com)，GitHub 登录
2. **New → Web Service**
3. 连接你的 repo
4. 设置：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
5. 添加环境变量（同上）
6. 选择 **Free** 计划（注意：免费版闲置 15 分钟后会休眠，首次访问需等 30 秒）

---

## 部署后检查清单

- [ ] 访问首页能看到星空和星球
- [ ] 输入问题后 3 个模型都能返回结果
- [ ] DeepSeek 分析摘要正常显示
- [ ] 选择模型后评价面板正常弹出
- [ ] 深聊功能正常
- [ ] 星际护照/雷达图正常显示

---

## 自定义域名（可选）

### Railway
1. Settings → Domains → Add Custom Domain
2. 在你的域名 DNS 中添加 CNAME 记录指向 Railway 提供的地址

### Vercel
1. Settings → Domains → Add Domain
2. 按提示配置 DNS

---

## 常见问题

**Q: 部署后页面白屏？**
A: 检查 Railway 的 Root Directory 是否设为 `backend`。因为 index.js 里用相对路径 `../../frontend/public` 去找前端文件，所以必须从 backend 目录启动。

**Q: API 返回 CORS 错误？**
A: 如果分离部署，确保后端 CORS 配置了前端域名。合并部署不会有这个问题。

**Q: 某个模型一直报错？**
A: 检查对应的 API Key 是否正确设置在环境变量中。可以访问 `/health` 检查后端是否正常运行。

**Q: Railway 免费额度够吗？**
A: Railway 每月给 $5 免费额度，对于这种轻量 API 中转服务完全够用。
