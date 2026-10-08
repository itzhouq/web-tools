import type { NextConfig } from "next";

// basePath 由环境变量控制：
//   默认（不设置）       → 部署到独立子域名，如 tools.example.com
//   NEXT_PUBLIC_BASE_PATH=/tools → 以主域名子路径部署，如 example.com/tools
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: __dirname },
};

export default nextConfig;
