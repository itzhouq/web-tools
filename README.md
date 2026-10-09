# web-tools · 风飞扬itzhouq的工具箱

**在线使用：[https://tools.itzhouq.cn](https://tools.itzhouq.cn)**

个人日常小工具集合：图片压缩、图片裁剪、图片水印、GIF 合成、长图切片、文字转图片、小红书封面、违禁词检测、简繁互转、人民币大写、JSON 格式化、Token 解析、时间戳转换、二维码生成。

**核心理念：全部工具纯前端实现，数据不上传，隐私零顾虑。**

> 📖 为什么做这个、架构怎么取舍的：见博客复盘 [《小工具，解决日常小麻烦：我的纯前端工具集上线了》](https://itzhouq.cn/blog/web-tools-launch)

## 技术栈

- Next.js 16（App Router，`output: export` 静态导出）
- React 19 + Tailwind CSS 4
- 部署：Cloudflare Pages

## 开发

```bash
npm install
npm run dev        # http://localhost:3000
```

## 构建与部署（双形态）

通过 `NEXT_PUBLIC_BASE_PATH` 环境变量切换部署形态，同一份代码两种输出：

### 1. 独立子域名（如 tools.example.com）

```bash
npm run build      # 不设 basePath，资源路径以 / 开头
npx wrangler pages deploy out --project-name web-tools --branch main
# 在 Cloudflare Dashboard 为该项目绑定自定义域 tools.<你的域名>
```

### 2. 主域名子路径（如 example.com/tools）

```bash
npm run build:subpath          # basePath=/tools
bash scripts/prepare-subpath.sh   # 将 _next 资源移入 tools/ 前缀下，使文件布局与 URL 完全一致
npx wrangler pages deploy out --project-name web-tools-subpath --branch main
```

然后在 Cloudflare 配置 Worker 路由 `example.com/tools*` → 反代到 `web-tools-subpath.pages.dev`（路径原样透传），参考 `worker/subpath-proxy.js`。

> 说明：子路径构建的 HTML 内资源引用均为 `/tools/_next/...`，`prepare-subpath.sh` 把导出目录中的 `_next` 移到 `tools/_next` 后，文件布局与 URL 一一对应，Worker 无需改写任何内容。

## 新增一个工具

1. 在 `lib/tools.ts` 注册元数据（slug、分类、图标、关键词）；
2. 在 `components/tools/<slug>.tsx` 实现客户端组件；
3. 在 `app/tools/<slug>/page.tsx` 添加路由与 metadata；
4. 首页分类与搜索、sitemap 自动生效。

## 工具子域名速查

每个工具都有独立短子域名（由 `worker/tools-subdomains.js` 路由，映射需与 `lib/subdomains.ts` 保持同步）：

| 子域名 | 工具 | 子域名 | 工具 |
|---|---|---|---|
| json.itzhouq.cn | JSON 格式化 | jwt.itzhouq.cn | Token 解析 |
| ts.itzhouq.cn | 时间戳转换 | qr.itzhouq.cn | 二维码生成 |
| img.itzhouq.cn | 图片压缩 | crop.itzhouq.cn | 图片裁剪 |
| mark.itzhouq.cn | 图片水印 | gif.itzhouq.cn | GIF 合成 |
| slice.itzhouq.cn | 长图切片 | card.itzhouq.cn | 文字转图片 |
| cover.itzhouq.cn | 小红书封面 | words.itzhouq.cn | 违禁词检测 |
| jianfan.itzhouq.cn | 简繁互转 | rmb.itzhouq.cn | 人民币大写 |

## 目录结构

```
app/                 # 路由（首页 + 8 个工具页 + robots/sitemap）
components/tools/    # 各工具的客户端实现
components/ui.tsx    # 共享 UI 基件（按钮、面板、文件拖放、滑杆等）
lib/tools.ts         # 工具注册表（首页/搜索/sitemap 的单一来源）
lib/xhs-dict.ts      # 违禁词内置词典（纯本地匹配）
scripts/             # 部署辅助脚本
worker/              # 子路径反代 Worker 示例
```
