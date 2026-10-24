# skixO visualiser

Audio-reactive visualiser for skixO releases. Drop in a track and artwork, tune the look live, and render a frame-accurate MP4 (16:9 for YouTube or 9:16 for Shorts and Reels) straight from the browser.

## How it works

- **Analysis** runs in the browser: the track is split into low and high bands to find kicks and hats, and its overall energy decides which pose shows when.
- **Poses** are four frames: eyes closed (flat light), eyes closed (side light), eyes open, and an optional half-open in-between. Light changes fade slowly; eye changes are clean cuts, snapped to the nearest kick, with occasional blinks while the eyes are open.
- **Rendering** is stateless: every frame is a pure function of time, so the preview and the export match exactly. Export uses WebCodecs (H.264 + AAC) and `mp4-muxer`, so it needs Chrome or Edge.
- **Memory**: settings live in localStorage; the last track and any artwork you drop in are kept in IndexedDB. Nothing leaves your browser.

## Project layout

```
public/
  index.html        markup and controls
  styles.css        studio UI
  app.js            analysis, rendering, export, UI
  assets/           starter artwork (the skixO Service set) and wordmark
  vendor/           mp4-muxer 5.1.3 (MIT)
middleware.js       password gate for the whole site
vercel.json         serves /public, no caching
```

## Access

The site is locked behind a browser sign-in. In Vercel, set these under Project → Settings → Environment Variables, then redeploy:

- `SITE_PASSWORD`: required. Until it's set, the site stays locked.
- `SITE_USER`: optional, defaults to `skixo`.

## Running locally

```
npm run dev
```

This serves `public/` without the password gate.
