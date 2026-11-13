# THE CHASE | McDavid vs. 215

Live tracker of Connor McDavid's run at Wayne Gretzky's 215-point season (1985–86).
A Cloudflare Worker serves the static site and proxies the NHL API.

## Layout

- `public/index.html` - the whole site (HTML, CSS, JS in one file)
- `public/img/` - player photos: `mcdavid.jpg` and `gretzky.jpg` (use images you have the rights to)
- `src/worker.js` - serves `/api/nhl/*` (allowlisted NHL paths, edge-cached); everything else is the static site
- `wrangler.jsonc` - Worker + static assets config

## Deploy

Connected to Cloudflare through GitHub. Every push to `main` runs `npx wrangler deploy`.
Build command: (blank). Deploy command: `npx wrangler deploy`.

## Notes

- Unofficial fan site. Not affiliated with the NHL or the Edmonton Oilers.
- Photo credits go in `CFG.CREDITS` near the top of the script in `public/index.html`.
