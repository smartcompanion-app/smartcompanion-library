// A real Ionic, for the specs that need one (*.ionic.browser.tsx). It is loaded
// here rather than in the spec because Stencil compiles every file under src,
// test files included, and an import of @ionic/core there makes it treat Ionic
// as part of this library and bundle all of its components into the build.
import { defineCustomElements } from '@ionic/core/loader';
import '@ionic/core/css/core.css';

await defineCustomElements(window);
export {};
