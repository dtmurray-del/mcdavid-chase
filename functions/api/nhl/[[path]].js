// Cloudflare Pages Function: GET /api/nhl/<path>  ->  https://api-web.nhle.com/v1/<path>
// Why: the browser talks to our own domain (no CORS problems) and Cloudflare caches the
// answer at the edge, so a busy night of fans doesn't hammer the NHL API.
//
// Only the paths listed in ALLOWED are proxied. To add a feature (schedule, live scores),
// add its path pattern here.

const UPSTREAM = "https://api-web.nhle.com/v1/";

const ALLOWED = [
  // McDavid's current season, or a historical season: /player/<id>/game-log/now  or  /player/<id>/game-log/19851986/2
  { re: /^player\/\d+\/game-log\/(now|\d{8}\/\d)$/, ttl: (p) => (p.endsWith("/now") ? 60 : 86400) },
];

export async function onRequestGet({ params }) {
  const path = [].concat(params.path || []).join("/");
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
      headers: { "content-type": "application/json" },
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
