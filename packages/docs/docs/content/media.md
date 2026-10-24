# Media

Audio files and images are not part of the app code and not inside the data file. The data file points at them by URL: either files bundled with the app, or files on a host you control.

## Where to host

| Option | Cost | Notes |
| --- | --- | --- |
| **Bundled with the app** | Free | The simplest arrangement — one deployment, no CORS. See [below](#bundling-the-content-with-the-app). |
| **GitHub Pages** | Free | A separate repository for content. Fine up to about 1 GB; a soft 100 GB/month bandwidth limit. |
| **Object storage** (S3, R2, Backblaze B2, GCS) | Cents | The right answer for a large guide. Cloudflare R2 has no egress charge. |
| **Your existing web space** | Already paid for | If your website has an `/audioguide/` directory, use it. |
| **A CDN in front of any of these** | Varies | Worth it for large guides or visitors from far away. |

What matters is not the provider but [the four requirements](#the-four-requirements) below — and bundling sidesteps two of them.

## Bundling the content with the app

`data_url` normally points at a host somewhere else. Give it a **repository-relative path** instead and the content ships inside the build, so the deployed app needs nothing but its own static host:

```yaml title="customization/my-museum/engraft.variables.yml"
data_url: customization/my-museum/data/data.json
```

The folder holding that `data.json` is copied into the build as `data/`, whatever it is called in the repository. So the repository path is yours to organise — next to the variant that uses it is the convention — while the app always reads `data/data.json`.

Because the served location is fixed, the asset URLs inside a bundled `data.json` are relative and start with `data/`:

```json
{ "id": "a1de", "filename": "a1de.mp3", "externalUrl": "data/assets/a1de.mp3", "language": "de" }
```

Relative URLs resolve against the page, so a bundled app keeps working when it is served from a subpath such as `https://<account>.github.io/<repository>/`.

### Setting it up

```
customization/my-museum/
├─ engraft.variables.yml
├─ assets/                 # logo, icon — the branding
└─ data/
   ├─ data.json
   └─ assets/              # audio and images — the content
      ├─ station-01.mp3
      └─ station-01.jpg
```

1. Put `data.json` and an `assets/` folder into a folder of the repository.
2. Write every `externalUrl` as `data/assets/<filename>` — `data/`, not the repository path.
3. Point `data_url` at the `data.json`.

The path has to sit **inside a folder** and stay inside the repository; the build stops with an explicit error otherwise.

The [Leon example](https://github.com/smartcompanion-app/audioguide-app/tree/main/customization/leon) works this way. The *Animals* default fetches its content from a separate host, so both arrangements stay exercised.

:::note[Two `assets/` folders, two different jobs]

`customization/<variant>/assets/` holds the **branding** — the logo and the icon source that engraft and the build pick up. `customization/<variant>/data/assets/` holds the **content** — the audio and images of the guide. They are unrelated.

:::

### What you gain

- **One deployment.** No second host, no second repository.
- **No CORS.** Same origin, so that whole class of problem does not arise.
- **Atomic updates.** Content and app version move together.

### What you give up

- **Content changes need a rebuild and a redeploy.** With external hosting, publishing a new `data.json` updates the guide at once.
- **Media lands in git.** Audio files are large and binary; a guide with a few hundred megabytes of MP3s makes for an unpleasant repository. Consider [Git LFS](https://git-lfs.com/), or keep the media external and bundle only the JSON.

Bundling suits a guide whose content changes once a season. External hosting suits one that is edited weekly.

## The four requirements

### 1. HTTPS

The app is served over HTTPS, so it cannot fetch anything over plain HTTP — browsers block the mixed content. Every absolute `externalUrl` must be `https://`.

### 2. CORS

Media on another host is fetched from a **different origin** than the app. Without a permissive CORS header the browser blocks the request, and you get missing pictures or a silent player, with an error only in the console.

Your media responses need this header:

```
Access-Control-Allow-Origin: *
```

Or, to be specific, the exact origin the app is served from.

**GitHub Pages** already sends `Access-Control-Allow-Origin: *` on everything. Nothing to do.

**nginx:**

```nginx
location /audioguide/ {
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;
}
```

**Apache:**

```apacheconf
<Directory /var/www/audioguide>
    Header set Access-Control-Allow-Origin "*"
</Directory>
```

**AWS S3** — bucket → Permissions → CORS:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges"]
  }
]
```

**Cloudflare R2** — set the same CORS policy on the bucket.

Check it in one command; no output means no header, and the browser will refuse the file:

```bash
curl -sI -H "Origin: https://guide.example.org" https://example.org/assets/a1en.mp3 \
  | grep -i access-control-allow-origin
```

### 3. Range requests

Seeking in audio needs HTTP range requests — `Accept-Ranges: bytes` and correct `206 Partial Content` responses. Every static host does this by default; some misconfigured proxies and serverless handlers do not. If visitors can play audio but not scrub through it, this is why.

```bash
curl -sI -H "Range: bytes=0-99" https://example.org/assets/a1en.mp3 | head -1
# HTTP/2 206
```

### 4. Stable URLs

Treat a published `externalUrl` as belonging to one version of one file.

To **replace** a file — a re-recorded narration, a better photo — give the new version a new file name and URL, update the asset entry, and change the `checksum`. Do not overwrite the file in place: with [offline support](../features/offline.md#what-gets-cached) the service worker keeps media it has cached and never asks the server again, so visitors who already have the old file go on hearing it.

To **retire** a file, leave it on the server until visitors have picked up the new `data.json`; a device with the old content still requests it.

## Audio

**Format.** MP3 plays everywhere. AAC in an `.m4a` container also works in every supported browser and gives slightly better quality per byte; MP3 remains the safe default.

**Bitrate.** Speech does not need much:

| Content | Bitrate | Roughly |
| --- | --- | --- |
| Single voice, mono | 64 kbps | 0.5 MB per minute |
| Voice with music or ambience, mono | 96 kbps | 0.7 MB per minute |
| Music-heavy, stereo | 128 kbps | 1 MB per minute |

A 30-station guide at three minutes a station is about 45 MB per language at 64 kbps — a reasonable offline download. The same guide at 320 kbps stereo is 225 MB, and visitors on a hotel Wi-Fi will give up.

**Mono, for speech.** A narrator recorded in stereo is two copies of the same signal. Downmixing halves the size and loses nothing.

Converting with [ffmpeg](https://ffmpeg.org/):

```bash
ffmpeg -i narration.wav -ac 1 -ar 44100 -b:a 64k -codec:a libmp3lame station-01-en.mp3
```

A whole folder:

```bash
for f in raw/*.wav; do
  ffmpeg -i "$f" -ac 1 -ar 44100 -b:a 64k -codec:a libmp3lame "out/$(basename "${f%.wav}").mp3"
done
```

**Normalise the loudness.** Stations recorded on different days at different levels make visitors reach for the volume at every stop. Target −16 LUFS for mono speech:

```bash
ffmpeg -i in.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 -ac 1 -b:a 64k out.mp3
```

**Strip the metadata**, or set it correctly. Some devices show the file's own ID3 title on the lock screen.

```bash
ffmpeg -i in.mp3 -map_metadata -1 -metadata title="1 – The Great Hall" -codec copy out.mp3
```

### Length

Two to four minutes per station works. Under a minute feels like it was not worth stopping for; over five and visitors walk away mid-sentence. A station that needs ten minutes is probably two stations.

## Images

**Format.** JPEG for photographs, PNG for diagrams, logos and anything with flat colour or transparency. WebP works in every supported browser and is 25–35 % smaller.

**Which image goes where.** On the default main screen a station's first image is the large picture at the top and its second is the picture on its card in the list, or the first again if there is only one — see [Stations](./stations.md#images). The slideshow exists only on the multi-track station page.

**Size.** Every picture is at most phone-width. Beyond about 1600 px on the long edge you pay for pixels nobody sees:

| Use | Long edge | Target file size |
| --- | --- | --- |
| Large station picture (first image) | 1200–1600 px | 150–300 KB |
| Card picture (second image) | 600–800 px | 50–100 KB |
| Tour cover | 1200 px | 150–250 KB |

Resize and compress:

```bash
# ImageMagick
magick input.jpg -resize 1600x1600\> -quality 82 -strip station-01.jpg

# or ffmpeg
ffmpeg -i input.jpg -vf "scale='min(1600,iw)':-1" -q:v 4 station-01.jpg
```

`-strip` removes EXIF data — smaller files, and no GPS coordinates of your storage room shipped to visitors.

**Orientation.** Landscape reads better. Portrait images work but leave large margins on a phone held upright.

**Two images per station** is what the default app uses; with one, the card repeats it. On the multi-track page, which shows them all, two to four is a good ceiling: a visitor swiping through twelve photographs is not listening.

## Naming files

```
station-01-en.mp3      not   Audio Final v3 (2).mp3
station-01-hall.jpg    not   IMG_4432.JPG
```

Lower case, no spaces, no umlauts or accents. Keep `filename` unique across the whole guide. Keep the files in a folder called `assets/` — the offline service worker only caches media whose URL contains `assets/`, see [Offline](../features/offline.md#what-gets-cached).

## Budgeting an offline download

With [offline support](../features/offline.md), a visitor downloads **the audio of their language plus every image**. Do the arithmetic before you commit to it:

```
  stations × minutes × MB per minute     audio, one language
+ stations × images × image size         images, shared
```

A 25-station guide, three minutes per station at 64 kbps, three images of 200 KB each:

```
25 × 3 × 0.5 MB   = 37.5 MB   audio
25 × 3 × 0.2 MB   = 15.0 MB   images
                    ────────
                    52.5 MB
```

Under 100 MB is comfortable on venue Wi-Fi. Past 200 MB, look at whether the images need to be that large.

## Checklist

- [ ] Every absolute `externalUrl` is `https://` and loads
- [ ] `Access-Control-Allow-Origin` is present on media from another host
- [ ] Range requests work — `curl -I -H "Range: bytes=0-99"` gives `206`
- [ ] Audio is mono, around 64 kbps, loudness-normalised
- [ ] Images are at most ~1600 px on the long edge, without EXIF
- [ ] `filename` values are unique, lower case and ASCII
- [ ] The total offline download is a size your visitors will tolerate
