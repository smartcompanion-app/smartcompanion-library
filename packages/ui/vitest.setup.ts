if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

// Swiper v14 dropped the `window.HTMLSlotElement &&` guard in front of its
// `element instanceof HTMLSlotElement` checks. Stencil's mock-doc has no such
// global, so constructing a Swiper throws "Right-hand side of 'instanceof' is
// not an object". A stand-in class nothing is an instance of restores v12
// behaviour; jsdom and the browser project already provide the real one.
if (typeof globalThis.HTMLSlotElement === 'undefined') {
  globalThis.HTMLSlotElement = class HTMLSlotElement {} as unknown as typeof globalThis.HTMLSlotElement;
}

await import('./dist/smartcompanion-ui/smartcompanion-ui.esm.js');
export {};
