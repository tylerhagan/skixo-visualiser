# skixO visualiser

Audio-reactive visualiser for skixO releases. Drop in a track and artwork, tune the look live, and render a frame-accurate MP4 (16:9 for YouTube or 9:16 for Shorts and Reels) straight from the browser.

## How it works

- **Analysis** runs in the browser: the track is split into low and high bands to find kicks and hats, and its overall energy decides which pose shows when.
- **Poses** are up to three frames: flat light, side light and an optional peak face, all with the closed-eye smile. Light changes fade slowly; the peak face (widest smile) cuts in on a kick at the biggest moments. Optional nod frames for each light make the head bob on the beat; only the head is taken from them and aligned over the base body.
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

## Roadmap

Done: release groups with shared looks, group backup files, looks with artwork recolouring, background library (sets x palettes) with opacity, blur and drift, glitch layer (tearing, colour split, block shifts, VHS roll, section bursts), tabbed panel, section scenes, Spotify Canvas loops, dual-format renders, still presets (YouTube, Instagram 4:5, Story, square) with headline type, font choice (Google set or installed fonts).

Next:
0. Done: timed captions, tap to time, per-section motion. Ideas: Whisper draft captions in the browser (best on a vocal stem), word-by-word reveal, clickable timeline blocks.
1. Section-aware scenes (done: backgrounds per quiet, lifted and peak). Still to do: per-section glitch level.
2. Procedural scenes: time-of-day sky, halftone rays, record grooves, falling dashes.
3. Per-group artwork (different mascot sets per group).
4. More glitch: pixel-sort streaks, datamosh smear between scenes, mirrored/tiled world, floating repeated mascots.
