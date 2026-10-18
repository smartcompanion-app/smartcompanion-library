# Colors

You name **two** colours. The build computes the rest — light mode, dark mode, shades, tints, contrast — from them.

```yaml
primary_color: "#8a3324"
background_color: "#f4efe7"
```

That is normally the whole colour customization.

## Why two

A palette has a lot of values in it, and most of them are not choices. A card sits one step off the page background; a dark palette is the light one at low lightness. Asking every institution for fourteen hex codes is busywork that also lets the values drift apart with nothing to catch it.

So the derivation lives in [`src/global/_color-helpers.scss`](https://github.com/smartcompanion-app/audioguide-app/blob/main/src/global/_color-helpers.scss) and runs at build time, in Sass. Every derived value can still be overridden — see [Overriding a derived colour](#overriding-a-derived-colour) — but you start from two.

## The colours you choose

**`background_color`** is the page background in light mode. The whole light palette follows from it — card surfaces, menu borders, Ionic's `light` colour — and, through a hue-preserving transform, the entire dark palette.

Pick something close to white or a light neutral. A dark `background_color` gives a dark-looking light mode and a dark mode hardly different from it.

**`primary_color`** is your brand colour: buttons, active states, the station progress ring. It is a background for `primary_color_contrast`, so a mid-tone reads best. Very pale primaries leave white text unreadable; very dark ones make the interface heavy.

**`primary_color_contrast`** is the text and icon colour on the primary, white by default. It is deliberately not derived: the automatic contrast rule picks black for the default primary, and whether white or black sits on your brand colour is a design decision.

## What is derived, and how

| Colour | Rule |
| --- | --- |
| `background_color_dark` | Same hue, saturation reduced to 60 % of its value, lightness at 11 % |
| `card_background_color` | `background_color` stepped 5 % away from itself |
| `card_background_color_dark` | `background_color_dark` stepped 5 % |
| `menu_border_color` | `background_color` stepped 10 % |
| `menu_border_color_dark` | `background_color_dark` stepped 10 % |
| `station_icon_progress_color` | `primary_color` stepped 18 % away from the light background |
| `station_icon_progress_color_dark` | `primary_color` stepped 18 % away from the dark background |
| `light_color` / `light_color_dark` | The background colours themselves |
| Shades and tints of primary and light | Ionic's own algorithm — mix 12 % black, mix 10 % white |
| Contrast for `light` | Black or white, whichever gives the better WCAG ratio |

### "Stepped away from the background"

The step function moves a colour *away from* the background it sits on: **darker** on a light background, **lighter** on a dark one. That lets one rule serve both palettes — a card is a step off the background in either mode, and it comes out visible in both.

For the station progress ring, the colour being moved and the reference differ: the ring is a step off the *primary*, but the *background* it sits on decides the direction. That is why it has two variants.

### Shades and tints match Ionic

`shade`, `tint` and `contrast` transcribe into Sass the algorithm behind Ionic's [color generator](https://ionicframework.com/docs/theming/colors#new-color-creator). The output is identical hex for hex: paste your primary into that tool and the shade and tint it shows are the ones the build produces.

## The variables that reach the browser

The Sass emits CSS custom properties on `:root`, and a second set under `:root.ion-palette-dark`:

```css
--sc-background-color
--sc-background-color-rgb
--sc-card-background-color
--sc-menu-border-color
--sc-station-icon-progress

--sc-primary-color
--sc-primary-color-rgb
--sc-primary-color-contrast
--sc-primary-color-contrast-rgb
--sc-primary-color-shade
--sc-primary-color-tint

--sc-light-color
--sc-light-color-rgb
--sc-light-color-contrast
--sc-light-color-contrast-rgb
--sc-light-color-shade
--sc-light-color-tint
```

These are mapped onto Ionic's `--ion-color-*` properties, so Ionic components pick up your brand automatically. The `*-rgb` variants hold a bare `r, g, b` list, which lets a component write `rgba(var(--sc-primary-color-rgb), 0.5)`.

You can read or set any of them at runtime — which is what the [embedding API](../features/embedding.md) does.

## Dark mode

The app follows the operating system. `src/global/app.ts` watches `prefers-color-scheme: dark` and toggles the class `ion-palette-dark` on `<html>`; the dark half of the palette is defined against that class.

- **You cannot force light mode** through the customization variables. A visitor whose phone is in dark mode gets dark mode. (An embedding page can force a palette; see [Embedding](../features/embedding.md).)
- **The `theme-color` metas follow the active palette.** `app.ts` reads the live background colour and writes it into them, so the browser's own interface matches the app in both modes.

Always check both palettes before publishing. A logo that reads well on cream is often invisible on near-black — which is why there are two logo variables. See [Logos and icons](./logos-and-icons.md).

## Overriding a derived colour

Name it in your values file:

```yaml
primary_color: "#8a3324"
background_color: "#f4efe7"

# Explicit, because the derived dark background came out too warm
background_color_dark: "#1c1a18"
```

Everything you do not name stays derived, including values derived *from* the one you overrode — set `background_color_dark` and `card_background_color_dark` follows your value, not the computed one.

Override sparingly. Every explicit value is one more thing that can drift out of step with the rest.

## Checking the result

**Contrast.** Text on your primary needs a WCAG AA ratio of 4.5:1 for body text, 3:1 for large text. A brand colour that looks fine in a brochure often fails on a phone in sunlight.

**Both palettes, on a real device.** Emulated dark mode in a desktop browser is not an OLED phone at night.

**The station progress ring** is the colour that most often disappears. If your primary is very close to your background, 18 % of lightness may not be enough separation; override `station_icon_progress_color`.

**Outdoors.** For a garden or a town walk, look at it in daylight. Pastel palettes that are elegant indoors can be unusable outside.

## Worked example

The *Leon* variant names two colours and lets everything else derive:

```yaml title="customization/leon/engraft.variables.yml"
primary_color: "#737373"
background_color: "#f5f5f5"
```

From `#f5f5f5` the dark background comes out near-black; cards step to a slightly darker grey in light mode and a slightly lighter one in dark mode; the progress ring steps off `#737373` in whichever direction the background requires. Two lines, two palettes.
