# Silhouette dataset

`countries.js` is a readable compiled data file loaded by the quiz at runtime.

This revision combines generalized administrative masks with intermediate-resolution coastline data for entries whose previous outlines were visibly over-simplified. Iceland and selected water-separated countries use complete coastline polygons. Existing hand-rebuilt silhouettes are retained for tiny islands and dispersed archipelagos where they provide better quiz readability.

Because the file combines Natural Earth public-domain material, CC0 country polygons, and GSHHG-derived LGPL material without retained per-coordinate provenance, the entire file is distributed under `LGPL-3.0-or-later` as a conservative licensing measure.

The file itself is the preferred form for modification. See the repository-level `LICENSE`, `THIRD_PARTY_NOTICES.md`, `ISLAND_VALIDATION.md`, `SILHOUETTE_VALIDATION.md`, and `LICENSES/` directory.

Each entry also includes approximate land-area and geographic-center metadata used only for randomized distractor selection.
