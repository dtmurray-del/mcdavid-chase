// Cloudflare Worker: serves the static site from ./public and proxies the NHL API.
//   GET /api/nhl/<path>  ->  https://api-web.nhle.com/v1/<path>
// Why: the browser talks to our own domain (no CORS problems) and Cloudflare caches the
// answer at the edge, so a busy night of fans doesn't hammer the NHL API.
//
// Only the paths listed in ALLOWED are proxied. To add a feature (schedule, live scores),
// add its path pattern here.

const UPSTREAM = "https://api-web.nhle.com/v1/";
const PREFIX = "/api/nhl/";

const ALLOWED = [
  // McDavid's current season, or a historical season:
  //   player/<id>/game-log/now   or   player/<id>/game-log/19851986/2
  { re: /^player\/\d+\/game-log\/(now|\d{8}\/\d)$/, ttl: (p) => (p.endsWith("/now") ? 60 : 86400) },
  // Today's scoreboard (live banner): score/now  or  score/2026-11-13
  { re: /^score\/(now|\d{4}-\d{2}-\d{2})$/, ttl: () => 10 },
  // Edmonton's season schedule (backup source for the game-day countdown)
  { re: /^club-schedule-season\/[A-Z]{3}\/now$/, ttl: () => 300 },
];

async function proxy(path) {
  const rule = ALLOWED.find((r) => r.re.test(path));
  if (!rule) return new Response("Not found", { status: 404 });

  const ttl = rule.ttl(path);
  let upstream;
  try {
    upstream = await fetch(UPSTREAM + path, {
      headers: { accept: "application/json" },
      cf: { cacheTtl: ttl, cacheEverything: true },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "NHL API unreachable" }), {
      status: 502,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: "NHL API returned " + upstream.status }), {
      status: upstream.status === 404 ? 404 : 502,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${Math.min(ttl, 60)}`,
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith(PREFIX)) {
      if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
      return proxy(decodeURIComponent(url.pathname.slice(PREFIX.length)));
    }
    return env.ASSETS.fetch(request);
  },
};
