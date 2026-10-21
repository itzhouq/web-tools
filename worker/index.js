const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    // 记一次使用：POST /api/hit {"tool":"qr-code"}
    if (url.pathname === "/api/hit" && request.method === "POST") {
      const { tool = "unknown" } = await request.json().catch(() => ({}));
      if (!/^[\w-]{1,40}$/.test(tool)) {
        return Response.json({ ok: false, error: "bad tool" }, { status: 400, headers: CORS });
      }
      const day = new Date().toISOString().slice(0, 10);
      const [count, total, today] = await Promise.all([
        env.COUNTER.get(`tool:${tool}`),
        env.COUNTER.get("total"),
        env.COUNTER.get(`day:${day}`),
      ]);
      await Promise.all([
        env.COUNTER.put(`tool:${tool}`, String(Number(count || 0) + 1)),
        env.COUNTER.put("total", String(Number(total || 0) + 1)),
        env.COUNTER.put(`day:${day}`, String(Number(today || 0) + 1)),
      ]);
      return Response.json({ ok: true, tool, count: Number(count || 0) + 1 }, { headers: CORS });
    }

    // 全站统计：GET /api/stats
    if (url.pathname === "/api/stats") {
      const list = await env.COUNTER.list({ prefix: "tool:" });
      const tools = {};
      await Promise.all(
        list.keys.map(async (k) => {
          tools[k.name.slice(5)] = Number(await env.COUNTER.get(k.name));
        })
      );
      const total = Number((await env.COUNTER.get("total")) || 0);
      return Response.json({ ok: true, total, tools }, { headers: CORS });
    }

    return Response.json({ ok: false, error: "try /api/hit or /api/stats" }, { status: 404, headers: CORS });
  },
};
