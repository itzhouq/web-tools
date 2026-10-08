/**
 * 主域名子路径反代 Worker 示例
 * 路由：example.com/tools* → web-tools-subpath.pages.dev（路径原样透传）
 *
 * 部署方式（二选一）：
 * 1. Dashboard：Workers & Pages → 创建 Worker → 粘贴本文件 → 添加路由 example.com/tools*
 * 2. wrangler：在 worker/ 目录执行 `wrangler deploy`（需先在 wrangler.toml 配置 route）
 */
export default {
  async fetch(request: Request): Promise<Response> {
    const upstream = "https://web-tools-subpath.pages.dev";
    const url = new URL(request.url);
    return fetch(`${upstream}${url.pathname}${url.search}`, request);
  },
};
