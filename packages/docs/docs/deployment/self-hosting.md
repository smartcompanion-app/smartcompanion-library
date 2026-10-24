# Self-hosting

If you already run a web server, hosting the guide is copying a directory onto it. There is nothing to install, nothing to keep running, and nothing to monitor beyond the web server you already monitor.

```bash
npm run build
rsync -av --delete www/ user@server:/var/www/guide/
```

That is the deployment.

## nginx

```nginx title="/etc/nginx/sites-available/guide"
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name guide.museum.org;

    ssl_certificate     /etc/letsencrypt/live/guide.museum.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/guide.museum.org/privkey.pem;

    root /var/www/guide;
    index index.html;

    # The entry point, the service worker and the content must always be
    # revalidated, or visitors keep an old version.
    location = /index.html      { add_header Cache-Control "no-cache" always; }
    location = /sw.js           { add_header Cache-Control "no-cache" always; }
    location = /data/data.json  { add_header Cache-Control "no-cache" always; }

    # Content-hashed file names: safe to cache forever.
    location /build/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location /assets/ {
        add_header Cache-Control "public, max-age=86400" always;
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}

server {
    listen 80;
    listen [::]:80;
    server_name guide.museum.org;
    return 301 https://$host$request_uri;
}
```

No `try_files` fallback is needed: the app uses hash-based URLs, so every URL the browser requests is a real file.

## Apache

```apacheconf title="/etc/apache2/sites-available/guide.conf"
<VirtualHost *:443>
    ServerName guide.museum.org
    DocumentRoot /var/www/guide

    SSLEngine on
    SSLCertificateFile    /etc/letsencrypt/live/guide.museum.org/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/guide.museum.org/privkey.pem

    <Directory /var/www/guide>
        Require all granted
        Options -Indexes
    </Directory>

    <FilesMatch "^(index\.html|sw\.js|data\.json)$">
        Header set Cache-Control "no-cache"
    </FilesMatch>

    <LocationMatch "^/build/">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </LocationMatch>

    AddOutputFilterByType DEFLATE text/css application/javascript application/json image/svg+xml
</VirtualHost>
```

`mod_headers` and `mod_deflate` need to be enabled.

## Object storage behind a CDN

S3, R2, GCS or Backblaze B2 with a CDN in front suits a guide with a lot of traffic or a widely spread audience:

```bash
aws s3 sync www/ s3://my-guide/ --delete \
  --cache-control "public, max-age=31536000, immutable"

# Then correct the files that must not be cached
aws s3 cp www/index.html s3://my-guide/index.html --cache-control "no-cache"
aws s3 cp www/sw.js      s3://my-guide/sw.js      --cache-control "no-cache"
```

Set the bucket's index document to `index.html`, and **invalidate the CDN** for `/index.html` and `/sw.js` after each deploy. A CDN that keeps serving an old `index.html` is the most common way a deploy appears not to have happened.

## HTTPS

Not negotiable:

- Service workers do not register over plain HTTP, so [offline support](../features/offline.md) does not work
- Browsers block media fetched over HTTP from an HTTPS page
- Some QR scanners refuse plain HTTP URLs

[Let's Encrypt](https://letsencrypt.org/) with certbot is free and automatic:

```bash
sudo certbot --nginx -d guide.museum.org
```

## MIME types

Every mainstream server gets these right out of the box. Check them if something behaves oddly:

| Extension | Type |
| --- | --- |
| `.js` | `application/javascript` |
| `.json` | `application/json` |
| `.svg` | `image/svg+xml` |
| `.woff2` | `font/woff2` |

A `.js` served as `text/plain` means a blank page and a module-loading error in the console.

## A subdirectory

Serving from `https://museum.org/guide/` instead of a domain of its own needs the two path fixes after the build:

```bash
npm run build
sed -i 's|"/build/|"build/|g' www/index.html
sed -i "s|'/sw.js'|'/guide/sw.js'|" www/index.html
rsync -av --delete www/ user@server:/var/www/museum/guide/
```

A subdomain avoids both and gives a shorter URL for the QR code. Prefer it if you can.

## Hosting media on the same server

You can serve `data.json` and the media from the same host as the app, outside the build. Same origin means CORS stops mattering:

```nginx
location /guide-content/ {
    add_header Cache-Control "public, max-age=2592000" always;
    add_header Access-Control-Allow-Origin "*" always;  # harmless, and useful if the app ever moves
}

location = /guide-content/data.json {
    add_header Cache-Control "no-cache" always;
    add_header Access-Control-Allow-Origin "*" always;
}
```

Then `data_url` is `https://guide.museum.org/guide-content/data.json`. Keep the media in an `assets/` folder below it for [offline caching](../features/offline.md#what-gets-cached).

## Deploying from CI

Even for your own server, build in CI rather than on a laptop:

```yaml title=".github/workflows/deploy.yml"
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx engraft apply --template engraft.template.yml --values customization/my-museum/engraft.variables.yml
      - run: npm run build

      - name: Deploy over rsync
        run: |
          install -m 600 /dev/null ~/deploy_key
          echo "${{ secrets.DEPLOY_KEY }}" > ~/deploy_key
          rsync -az --delete -e "ssh -i ~/deploy_key -o StrictHostKeyChecking=accept-new" \
            www/ "${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}:/var/www/guide/"
```

Use a key that can write to that one directory only. A deploy key that can write anywhere on the server eventually writes somewhere you did not intend.

## Backups

The app is rebuilt from the repository, so it needs no backup. What does:

- **Your content** — `data.json` and the media. The irreplaceable part; the recordings especially.
- **Your customization directory** — small, but tedious to reconstruct.
- **The original audio masters.** Keep the uncompressed recordings somewhere safe. Re-encoding from an MP3 loses quality you cannot get back.
