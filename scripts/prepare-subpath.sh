#!/usr/bin/env bash
# 子路径部署准备：把 out/_next 移入 out/tools/_next，
# 使文件布局与 basePath=/tools 构建的 URL 完全一致。
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d out/_next ]; then
  echo "错误：out/_next 不存在，请先运行 npm run build:subpath" >&2
  exit 1
fi

mv out/_next out/tools/_next
echo "OK: 资源已移至 out/tools/_next，可部署到 web-tools-subpath 项目"
