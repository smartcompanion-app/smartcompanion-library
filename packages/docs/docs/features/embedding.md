# Embedding

The app can be embedded in an iframe and driven from the host page with `postMessage` — changing its colours, logos and palette at runtime, without a rebuild.

This is what powers the live customization preview on [smartcompanion.app](https://www.smartcompanion.app/): a phone-shaped frame with colour pickers next to it, updating as you drag.

## Enabling it

```yaml title="customization/my-museum/engraft.variables.yml"
messaging_support: "true"
```

The *Animals* demo has it on; applying a values file turns it off unless the file asks for it. For a plain public deployment there is no reason to have it, since it installs a listener that accepts messages from any page.

## Embedding the app

```html
<iframe src="https://guide.example.org/" style="width: 320px; height: 640px; border: 0" title="Audioguide preview"></iframe>
```

A phone-sized frame is the point; the layout is made for a phone. Styling it as a device with a rounded bezel is worth copying — people read a phone frame at once.

## The messages

Three message types, each `{ type, payload }`, posted to the iframe's `contentWindow`.

### `UPDATE_CSS_VARIABLES`

Sets CSS custom properties on the document root.

```js
iframe.contentWindow.postMessage(
  {
    type: 'UPDATE_CSS_VARIABLES',
    payload: {
      '--sc-primary-color': '#8a3324',
      '--sc-background-color': '#f4efe7',
      '--sc-card-background-color': '#efe7db',
    },
  },
  '*',
);
```

The payload is a flat object of property name to value. Only string values are applied. Every `--sc-*` property can be set — the list is in [Colors](../customization/colors.md#the-variables-that-reach-the-browser).

The values are set as inline styles on `<html>`, so they win over both palettes: a colour set this way stays the same in light and dark mode. A preview that offers a dark-mode toggle sends the dark values along with the switch.

:::warning[Runtime overrides are not derived]

At build time, naming `background_color` derives the card colour, the menu border, the dark palette and the rest. Setting `--sc-background-color` over `postMessage` sets **exactly that one property**; nothing else follows.

A preview that changes only the background looks wrong, because the cards stay as they were. Compute the derived values on the host page, or set the whole group together.

:::

### `UPDATE_MENU_IMAGE`

Swaps the logo in the side menu.

```js
iframe.contentWindow.postMessage(
  {
    type: 'UPDATE_MENU_IMAGE',
    payload: {
      light: 'https://example.org/logo.png',
      dark: 'https://example.org/logo-dark.png',
    },
  },
  '*',
);
```

Both keys are optional; send one to change one. The handler sets the `src` of `#main-menu-image-light` and `#main-menu-image-dark`, so a fork that renames those ids breaks it. A `data:` URL works, so a preview can show a logo the visitor just picked from their own disk.

### `UPDATE_DARK_MODE`

Forces a palette, overriding the device preference.

```js
iframe.contentWindow.postMessage({ type: 'UPDATE_DARK_MODE', payload: 'dark' }, '*');
iframe.contentWindow.postMessage({ type: 'UPDATE_DARK_MODE', payload: 'light' }, '*');
```

It toggles `ion-palette-dark` on the root element — the same switch the system preference uses — and the `theme-color` metas follow. A later change of the operating system's mode still switches it back, so a host page that controls the palette should keep sending it.

## A worked example

```html
<iframe id="preview" src="https://guide.example.org/" width="320" height="640"></iframe>

<label>Primary <input type="color" id="primary" value="#8a3324" /></label>
<label>Background <input type="color" id="background" value="#f4efe7" /></label>
<button id="toggle">Toggle dark mode</button>

<script>
  const frame = document.getElementById('preview');
  const send = (type, payload) => frame.contentWindow.postMessage({ type, payload }, '*');

  const apply = () =>
    send('UPDATE_CSS_VARIABLES', {
      '--sc-primary-color': document.getElementById('primary').value,
      '--sc-background-color': document.getElementById('background').value,
      '--sc-light-color': document.getElementById('background').value,
    });

  document.getElementById('primary').addEventListener('input', apply);
  document.getElementById('background').addEventListener('input', apply);

  let dark = false;
  document.getElementById('toggle').addEventListener('click', () => {
    dark = !dark;
    send('UPDATE_DARK_MODE', dark ? 'dark' : 'light');
  });

  // Wait for the app to be listening before the first message.
  frame.addEventListener('load', apply);
</script>
```

A real preview also sends the derived colours — see [Colors](../customization/colors.md#what-is-derived-and-how) for the rules.

## Timing

Messages sent before the app's listener is installed are lost, and there is no ready handshake. Send the first batch on the iframe's `load` event, and resend on every change rather than assuming the app kept state.

## Security

The listener does **not** check `event.origin`. Any page that holds a reference to the app's window can send these messages.

The reach is small — colours and the logo `src`, nothing that reads or writes visitor data — but not nothing: a page embedding your guide can restyle it, even make it unreadable, and point the menu logo at any URL.

1. **Leave messaging off for public deployments** — `messaging_support: "false"`, which is what you get by not setting it.
2. **If you need it, tighten it** in your fork with an origin check:

   ```ts
   if (event.origin !== 'https://www.example.org') return;
   ```

From the host page, consider sending a specific `targetOrigin` instead of `'*'`.

## Use it for

- **A live customization preview**, as on the SmartCompanion website
- **A demo on your own site**, with your palette on a shared demo deployment
- **Design review** — colleagues try palettes without a build

For a real deployment, set the colours with [engraft](../customization/index.md). Runtime overrides are for previews: they are not derived, they do not survive a reload, and they leave a listener open.
