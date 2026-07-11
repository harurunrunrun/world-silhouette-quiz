# Silhouette dataset

`countries.js` is a readable compiled data file loaded by the quiz at runtime.

This revision replaces over-simplified small-country polygons with higher-detail source geometry. Tiny components in widely dispersed archipelagos are enlarged around their own centroids for legibility while their relative arrangement is retained.

Because the file combines Natural Earth public-domain material, CC0 country polygons, and GSHHG-derived LGPL material without retained per-entry provenance, the entire file is distributed under `LGPL-3.0-or-later` as a conservative licensing measure.

The file itself is the preferred form for modification. See the repository-level `LICENSE`, `THIRD_PARTY_NOTICES.md`, and `LICENSES/` directory.

## Island-layout revision

The island-state silhouettes in this revision were rebuilt from GSHHG full-resolution coastline polygons in geographic coordinates. Longitude wrapping is handled before normalization, and tiny components are enlarged only around their own centroids. This preserves north/south and east/west relationships while keeping small islands visible.

Each entry also includes approximate land-area and geographic-center metadata used only for randomized distractor selection.
