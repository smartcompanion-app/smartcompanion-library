# Access and sharing

Three optional parts of the data format, all about who gets in and how the guide travels: PIN codes, the share URL, and local download servers.

## PIN codes

Add a `pins` array and the app puts a keypad in front of the guide. After loading — and after the language is chosen — visitors must enter one of the listed codes before they see any content.

```json
"pins": ["1234", "5678", "9012"]
```

Each code must be exactly four digits (`^[0-9]{4}$`). Leave the array out for a guide with no gate.

### What it is for

A ticket desk hands out a code with the ticket. A confirmation email carries one. A code is printed on the back of a museum pass. It ties the guide to a paid visit without an account system.

### How long a code lasts

A correct code is remembered on the device for **six hours**; after that the visitor is asked again. That covers a visit and ends with it. The duration is the `validHours` property of `sc-page-pin`, so an app that needs a different one sets it on the route.

### What it is not

:::warning[PINs are not a security mechanism]

The codes are in `data.json`, which the app downloads over the public internet. Anyone who opens the network tab in their browser can read them, and the check runs in the visitor's browser, not on a server.

Treat it as a turnstile: it stops casual sharing and signals that the guide is part of a paid offer. It does not protect content you need to keep private. That needs the data behind authentication on a server, which is outside what this app does.

:::

### Practical use

- **Several codes, rotated.** Changing them each season keeps a leaked code from circulating forever. Every change is an edit to `data.json` and a new `checksum`.
- **One code per group is normal.** Per-visitor codes would mean regenerating the data file constantly; that is not what this feature is for.
- **Say where the code comes from** in the `enter-pin` text — it is the only explanation visitors get. See [UI texts](./ui-texts.md).
- **A wrong code shows `pin-error`** and nothing else. Make that message say what to do next.

### With offline support

The code is checked before the media download starts, so a visitor without a code downloads nothing. Once the guide is on the device, it still asks for the code again after six hours — the check needs no connection, since the codes are part of the stored data.

## Sharing

*Requires schema v1.1.*

```json
"share": "https://guide.example.org/"
```

Set `share` and a share item appears in the menu. Tapping it opens the device's own share sheet — messages, mail, AirDrop, whatever the visitor uses — with this URL.

The item is shown only when both are true:

- `share` is set in your data file
- the device can share (the Web Share API in a browser, checked with `Share.canShare()` from `@capacitor/share`)

On a desktop browser without share support the item is absent rather than broken. Its label, and the share sheet's title, are the `menu-share-app` text.

**What to put in it.** The public URL of your deployment — the one on your QR codes. Not a link to a station: a recipient should land at the start.

**Share and PIN together** deserve a thought: the link leads to a guide that asks for a code the recipient does not have. That may be what you want — the link advertises the guide, the code comes with a ticket — but say so in your `enter-pin` text.

## Local download servers

```json
"servers": ["192.168.1.50", "192.168.1.51"]
```

A list of IP addresses of servers on the venue's own network, meant for apps that download their media from the local network instead of the internet: forty school children downloading a 60 MB guide at once saturate a typical venue uplink, a machine on the LAN does not.

What the library and the default app actually do with it:

- **The library reads the key `servers`.** The schema spells it `server`, and that spelling is never picked up. Use `servers` if an app of yours relies on the list — knowing that a file with it does not validate against the schema.
- **The library only stores the list.** `getServerService().getRandomServer()` returns one of the addresses; using it is up to the app's download code.
- **The default app does not use it.** It is a web app served over HTTPS, and browsers block plain-HTTP requests to a local IP from it. The list is for native apps built with Capacitor, where the app's own download code can rewrite asset URLs to the local server.

## Checklist

- [ ] Every PIN is exactly four digits
- [ ] `enter-pin` explains where a visitor gets the code
- [ ] `pin-error` says what to do when the code is wrong
- [ ] `share` is the public entry URL of the guide
- [ ] `menu-share-app` is translated in every language
