#!/usr/bin/env bash
# 全量发布：子路径构建 + prepare + 两个 Pages 项目 + Worker
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== 1/4 子路径构建 ==="
NEXT_PUBLIC_BASE_PATH=/tools npx next build 2>&1 | tail -3

echo "=== 2/4 对齐布局 ==="
bash scripts/prepare-subpath.sh

echo "=== 3/4 部署 web-tools-subpath ==="
npx wrangler pages deploy out --project-name web-tools-subpath --branch main --commit-dirty=true 2>&1 | grep -E "✨|✘" | head -2

echo "=== 4/4 部署 Worker（新工具页分流）==="
cd worker
npx wrangler deploy 2>&1 | grep -E "Uploaded|Deployed|itzhouq.cn|✘" | head -4
