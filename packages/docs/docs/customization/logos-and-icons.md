# Logos and icons

Three image files carry your branding: a logo, its dark-mode variant, and one icon image the whole icon set is generated from.

| Variable | Used for | Format |
| --- | --- | --- |
| `logo` | Loading screen and menu, light mode | PNG with transparency, ~600 px wide |
| `logo_dark` | The same, dark mode | PNG with transparency, ~600 px wide |
| `icon_source` | Home-screen icons, Apple touch icon, favicon | Square, at least 512 × 512 px; SVG preferred |

```yaml
logo: assets/logo.png
logo_dark: assets/logo-dark.png
icon_source: customization/my-museum/assets/app-icon-512.png
```

`logo` and `logo_dark` are relative to the values file; `icon_source` is relative to the repository root.

## The logo

The logo appears on the loading screen while the guide loads, and at the top of the side menu.

**Transparent PNG.** The background behind it is your `background_color`, and it changes with dark mode. A logo on a baked-in white rectangle shows that rectangle.

**Wide rather than tall.** It sits above a list in a narrow menu, so a horizontal lockup uses the space; a tall stacked logo pushes the menu items down.

**Around 600 px wide** is enough for a high-density phone screen without shipping a needlessly large file. Run it through a PNG optimiser (`oxipng`, `pngquant`, ImageOptim) before committing.

### The dark variant

`logo_dark` is a separate file, not a filter. Usually it is the same mark with the text in a light colour.

If your logo already works on both backgrounds — a mid-tone mark with no dark text — point both variables at the same file. That is what *Leon* does:

```yaml
logo: assets/logo.png
logo_dark: assets/logo.png
```

### How the swap works

The menu holds both images, and CSS shows the one for the active palette:

```html
<img id="main-menu-image-light" src="assets/logo.png" />
<img id="main-menu-image-dark" src="assets/logo-dark.png" />
```

The loading screen gets both paths as properties of `sc-page-loading` and does the same.

:::note[Keep the two ids]

Swapping the image of a single `<img>` with the CSS `content` property is unreliable across browsers, so the app uses two elements. If you change the menu in your fork, keep the two ids — the [embedding API](../features/embedding.md) looks them up to swap logos at runtime.

:::

## The icon set

You provide **one** square image. Before every build and dev server start, `npm run icons` generates the whole set from it into a git-ignored folder, which the build copies to `assets/icon/`:

| File | Size | How it is made |
| --- | --- | --- |
| `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png` | 64, 192, 512 px | The image as is, transparency kept — the manifest's regular icons |
| `maskable-icon-512x512.png` | 512 px | The image shrunk to 70 % and centred on a solid background — for Android's icon shapes |
| `apple-touch-icon-180x180.png` | 180 px | The image filling the square, made opaque — for iOS |
| `favicon.ico` | 16, 32, 48 px | The browser tab icon |

Nothing generated is committed. Change `icon_source`, and the next build has the new set.

### The source image

- **Square**, and at least **512 × 512 px**. An SVG is best — it is drawn sharp at every size — but any common image format works.
- **A mark, not a wordmark.** At 48 device pixels, text is a smudge. Use an initial, a symbol, a crest.
- **Recognisable small.** Zoom out until it is the size of a real home-screen icon and see whether you can still tell what it is.
- **Full-bleed artwork is fine.** The maskable icon is padded for you, so you do not have to design a safe zone into the source.

### The background colour

The maskable and Apple icons need an opaque background. It is chosen in this order:

1. `icon_background_color`, if you set it
2. The source image's own background, if its four corners are opaque and the same colour
3. Your `background_color`

So an icon on a solid ground keeps that ground, and a mark on transparency sits on your page colour. Set `icon_background_color` when neither suits.

[maskable.app](https://maskable.app/editor) previews the maskable icon against every common launcher shape.

### iOS

iOS reads the Apple touch icon, not the manifest. It applies its own rounded corners and no mask, which is why that icon fills the square instead of being padded.

## Checklist

- [ ] The logos are transparent PNGs, about 600 px wide
- [ ] The dark logo is legible on the dark background — check on a device
- [ ] The icon source is square, at least 512 × 512 px, and has no small text
- [ ] The icon is recognisable at home-screen size
- [ ] The home-screen icon looks right on Android and on iOS
