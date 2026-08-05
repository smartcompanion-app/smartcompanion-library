---
'@smartcompanion/ui': major
---

- Changed map renderer from leaflet to maplibre for vector support
- The marker class is now station-map-marker (was station-map-icon)
- The marker anchor moved to bottom, so pins sit differently relative to their coordinate
- facade and mapBounds became required in the generated TSX types (the ! additions dropped their ? in the LocalJSX half of components.d.ts), so TSX consumers who omit them now get compile errors. 
- maplibre-gl is ~1 MB of JS + 70 KB CSS versus leaflet's ~150 KB