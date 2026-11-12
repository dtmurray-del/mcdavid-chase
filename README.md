# THE CHASE | McDavid vs. 215

Live tracker of Connor McDavid's run at Wayne Gretzky's 215-point season (1985–86).
Static site on Cloudflare Pages, with one Pages Function that proxies the NHL API.

## Layout

- `index.html` - the whole site (HTML, CSS, JS in one file)
- `functions/api/nhl/[[path]].js` - proxy for `api-web.nhle.com` (allowlisted paths, edge-cached)
- `img/` - player photos: `mcdavid.jpg` and `gretzky.jpg` (use images you have the rights to)

## Deploy

Cloudflare Pages is connected to this repo. Every push to `main` redeploys.

- Framework preset: None
- Build command: (blank)
- Build output directory: `/`

## Notes

- Unofficial fan site. Not affiliated with the NHL or the Edmonton Oilers.
- Photo credits go in `CFG.CREDITS` near the top of the script in `index.html`.
