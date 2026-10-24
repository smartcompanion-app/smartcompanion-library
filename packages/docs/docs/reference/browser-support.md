# Browser support

## Supported

| Browser | Minimum |
| --- | --- |
| Chrome / Edge | 110 |
| Safari | 16.4 — which means **iOS 16.4** |
| Firefox | 110 |

Chrome 110 and Firefox 110 are from February 2023, Safari 16.4 from March 2023.

The floor is set by [Swiper](https://swiperjs.com/) 14, which the station list and the image slideshow are built on — not by a choice of the project itself.

## What this means for a venue

On iOS, the browser version is the **system** version — Safari cannot be updated on its own. iOS 16.4 rules out the iPhone 6s, 7 and SE (1st generation), which stopped at iOS 15.

On Android the browser updates independently of the system, so an old phone with a current Chrome is fine.

Sharing needs the Web Share API and [offline support](../features/offline.md) needs service workers; both are in every supported browser, and the app hides the share item where sharing is not available.

## Devices the venue lends out

If you hand out phones or tablets rather than relying on visitors' own:

- **Check the system version before buying used.** An iPad stuck on iOS 15 does not run the guide.
- **Add the guide to the home screen** on each device, so nobody navigates a browser.
- **Use guided access or kiosk mode** so the device stays in the guide.
- **Load the content once, on Wi-Fi**, before a device goes out — especially with offline support.

## Desktop

The app works in a desktop browser. It is laid out for a phone; on wider screens the menu becomes a permanent side pane. Useful for testing and review, not what visitors use.

## In-app browsers

A link opened inside Instagram, Facebook, LinkedIn or a QR scanner app runs in an embedded browser, and those behave differently from the real one — no install, different storage, occasionally different audio handling. If many of your visitors arrive through social media, test there.

## Reporting a browser problem

Include:

- The browser and its version, the system version and the device
- The app version — `document.querySelector('meta[name="version"]').content`
- What you did, what happened, what you expected
- Anything in the browser console

Open it at [`audioguide-app/issues`](https://github.com/smartcompanion-app/audioguide-app/issues). If the problem is in a page or the player rather than the app shell, it moves to the [library](https://github.com/smartcompanion-app/smartcompanion-library/issues) — report it either way.
