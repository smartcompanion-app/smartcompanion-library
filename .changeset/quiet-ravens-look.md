---
'@smartcompanion/data': patch
'@smartcompanion/services': patch
---

Document an API removal that shipped undocumented in 0.10.0.

[#63](https://github.com/smartcompanion-app/smartcompanion-library/pull/63) removed `ServiceLocator` from `@smartcompanion/data` and `ServiceFacade.registerDefaultServices()` from `@smartcompanion/services`, replacing the service-locator indirection with direct accessors on the facade and narrow role contracts (`StationListFacade` and friends) on the UI pages. It went out in 0.10.0 without a changeset, so the changelog for that release does not mention it — code calling `registerDefaultServices()` fails on upgrade with nothing to explain why. Nothing changes in this release; this entry exists so the removal is on the record.

To migrate from 0.9.x:

- Delete the `registerDefaultServices()` call. The domain services, routing and menu are available directly from the facade — `getStationService()`, `getRoutingService()`, `getMenuService()` and the rest — with no registration step.
- If you passed a custom `resolveUrl` to it, pass it as the second constructor argument instead: `new ServiceFacade(storage, resolveUrl)`. The signature and the default are unchanged.
- Registering an audio player and a load service is still required, and still works exactly as before.
- Imports of `ServiceLocator` from `@smartcompanion/data` need removing. UI page components now declare the narrow contract they need rather than taking a locator.
