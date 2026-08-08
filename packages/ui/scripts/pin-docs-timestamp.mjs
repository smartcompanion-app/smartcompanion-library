// Stencil's `docs-json` output target stamps custom-elements.json with the time
// of the build, so the checked-in manifest came out modified after every build
// even when nothing about the components had changed. Pin that one field once
// the build has written the file: the manifest then only shows up in `git
// status` when the components themselves changed.
//
// Nothing reads the timestamp — Storybook consumes `components` via
// setCustomElementsManifest() in .storybook/preview.ts, and the file is not
// part of the published tarball.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PINNED_TIMESTAMP = '1970-01-01T00:00:00';

const manifestPath = fileURLToPath(new URL('../custom-elements.json', import.meta.url));
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

manifest.timestamp = PINNED_TIMESTAMP;

// Matches the formatting docs-json writes: two-space indent, no trailing newline.
await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
