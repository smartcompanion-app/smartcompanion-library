# Fonts

The app uses Ionic's default font, the device's own system font. Three variables replace it with your typeface:

| Variable | Relative to | What it does |
| --- | --- | --- |
| `font_family` | — | The CSS `font-family` for the whole app |
| `font_stylesheet` | the values file | A `.scss` file declaring the font, copied over `src/global/_fonts.scss` |
| `font_dir` | the repository root | A folder of font files, copied into the build as `assets/fonts/` |

`font_family` names the font; the stylesheet tells the browser where to find it. A self-hosted font needs all three, a font from a service needs only the first two.

## A self-hosted font

Put the font files and a stylesheet next to your values file:

```
customization/my-museum/
├─ engraft.variables.yml
├─ fonts.scss
└─ fonts/
   ├─ SourceSans3-Regular.woff2
   ├─ SourceSans3-Bold.woff2
   └─ OFL.txt
```

```yaml title="customization/my-museum/engraft.variables.yml"
font_stylesheet: fonts.scss
font_dir: customization/my-museum/fonts
font_family: "'Source Sans 3', sans-serif"
```

```scss title="customization/my-museum/fonts.scss"
@font-face {
  font-family: 'Source Sans 3';
  src: url('../assets/fonts/SourceSans3-Regular.woff2') format('woff2');
  font-weight: 400;
}

@font-face {
  font-family: 'Source Sans 3';
  src: url('../assets/fonts/SourceSans3-Bold.woff2') format('woff2');
  font-weight: 700;
}
```

The URLs read `../assets/fonts/<file>` whatever the folder is called in the repository: the build copies `font_dir` to `assets/fonts/`, and the compiled stylesheet sits in `build/`, one level below. The [Leon example](https://github.com/smartcompanion-app/audioguide-app/tree/main/customization/leon) works this way, with *Alegreya Sans* in three weights.

`font_dir` has to stay inside the repository and use forward slashes; the build stops with an explicit error otherwise.

Declare every weight the app uses — at least regular and bold. A missing weight is synthesised by the browser, and a synthesised bold looks smeared.

**Formats.** WOFF2 is the smallest and works in every [supported browser](../reference/browser-support.md). TTF and OTF work too, at two to three times the size.

**Licence.** Check that the font's licence allows embedding it in a website. Open fonts such as those under the SIL Open Font License do; keep the licence file next to the fonts.

## A font from a font service

A service such as Google Fonts needs no `font_dir`. The stylesheet only imports the font:

```scss title="customization/my-museum/fonts.scss"
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
```

```yaml title="customization/my-museum/engraft.variables.yml"
font_stylesheet: fonts.scss
font_family: "'Inter', sans-serif"
```

:::warning[Prefer self-hosting]

A linked font sends every visitor's IP address to the font service. A German court has ruled that a GDPR violation without the visitor's consent (LG München I, 3 O 17493/20). A linked font is also missing on a first visit without a connection.

Most fonts on Google Fonts are open-licensed and can be downloaded and self-hosted instead.

:::

## Offline

With [offline support](../features/offline.md), self-hosted fonts in `.woff2`, `.woff`, `.ttf` or `.otf` are precached with the app, so they are there on the first offline visit. A Google Font is cached by the service worker once it has loaded online; other font services are not cached.

## Leaving it out

All three variables are optional and have no default. Leaving them out leaves the files as they are — on a fresh checkout, Ionic's default font. When several [variants](./variants.md) are built in one working tree, a variant without fonts inherits the previous variant's font unless the files are reset in between.
