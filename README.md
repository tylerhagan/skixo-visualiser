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

Done: public case study at /case-study/; release groups with shared looks, artwork per group and backup files; looks with artwork recolouring; background library (sets x palettes) plus animated scenes (time-of-day sky, halftone rays, record grooves, falling dashes) with per-scene opacity, blur and drift; section scenes; motion and glitch per section; glitch layer (tearing, colour split, block shifts, VHS roll, pixel sort, datamosh at changes, mirror world, floating echoes); captions with tap to time, word-by-word reveal, full styling and a Whisper draft (beta); Spotify Canvas loops; dual-format renders; still presets with headline type; font choice; editor layout with clickable timeline lanes; tactile controls (knobs with live rings for movement, nod and glitch, section pads, an LCD with bar and beat, a beat light and level meters), coloured by the look; Look tab inputs (ink chips with hex and an eyedropper, a 3x3 text anchor with six label positions, font specimens, a thumbnail grid for mascot frames with drop targets, texture knobs, drag and scroll on the stage to place and size the portrait); tap tempo and a TAP pad; draggable section edges on the timeline; a record-style render button with a progress ring; swappable subject (mascot frames, a logo PNG or SVG with plain backgrounds knocked out, or the title) in a circle, rounded or cut-out frame with sticker edge, shadow and riso offset finishes; cut-out mascot with line art when quiet and headphones on at the peaks; patches A to D per group (each release picks one) and a shuffle with undo.

Ideas:
- Per-group artwork export inside group backup files
- Whisper word timings feeding the word-by-word reveal
- MIDI control from a pad controller (Maschine Mikro): pads trigger sections and glitch bursts, the encoder sweeps the selected knob
