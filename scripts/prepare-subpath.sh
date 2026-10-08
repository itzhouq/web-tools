#!/usr/bin/env bash
# 子路径部署准备：使文件布局与 basePath=/tools 构建的 URL 完全一致。
# 构建产物（out/）中：资源在 _next/、首页在 index.html，
# 但 HTML 内引用均为 /tools/_next/...、首页路由为 /tools/。
# 因此把 _next 移入 tools/_next，把 index.html 复制到 tools/index.html。
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d out/_next ]; then
  echo "错误：out/_next 不存在，请先运行 npm run build:subpath" >&2
  exit 1
fi

mv out/_next out/tools/_next
mkdir -p out/tools
cp out/index.html out/tools/index.html
[ -f out/404.html ] && cp out/404.html out/tools/404.html

echo "OK: 布局已对齐，可部署到 web-tools-subpath 项目"
