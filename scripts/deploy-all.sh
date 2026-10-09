#!/usr/bin/env bash
# 全量发布：默认构建→子域名；子路径构建→子路径项目；Worker 同步
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== 1/5 默认构建（子域名）==="
npm run build 2>&1 | tail -3

echo "=== 2/5 部署 web-tools（子域名）==="
npx wrangler pages deploy out --project-name web-tools --branch main --commit-dirty=true 2>&1 | grep -E "✨|✘" | head -2

echo "=== 3/5 子路径构建 + 对齐布局 ==="
NEXT_PUBLIC_BASE_PATH=/tools npx next build 2>&1 | tail -3
bash scripts/prepare-subpath.sh

echo "=== 4/5 部署 web-tools-subpath ==="
npx wrangler pages deploy out --project-name web-tools-subpath --branch main --commit-dirty=true 2>&1 | grep -E "✨|✘" | head -2

echo "=== 5/6 部署 Worker（子路径代理）==="
cd worker
npx wrangler deploy 2>&1 | grep -E "Uploaded|Deployed|itzhouq.cn|✘" | head -4

echo "=== 6/6 部署 Worker（工具子域名）==="
npx wrangler deploy -c wrangler-subdomains.jsonc 2>&1 | grep -E "Uploaded|Deployed|itzhouq.cn|✘" | head -4
