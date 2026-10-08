/**
 * 主域名子路径反代 Worker
 * 路由：itzhouq.cn/tools* → web-tools-subpath.pages.dev（路径原样透传）
 */
export default {
  async fetch(request) {
    const upstream = "https://web-tools-subpath.pages.dev";
    const url = new URL(request.url);
    return fetch(`${upstream}${url.pathname}${url.search}`, request);
  },
};
