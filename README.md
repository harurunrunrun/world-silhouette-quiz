# World Country Silhouette Quiz

A 10-question, four-choice country silhouette quiz that runs entirely in a web browser. It requires no server-side code, build process, or external CDN.

## Features

- Standard mode: 195 countries
- Expanded mode: 205 entries, adding 10 non-UN-member, partially recognized, or de facto independent entities
- Ten questions from the entire world or one of six regions
- Randomized distractors selected from entries with similar outline features
- Keyboard controls: press `1`–`4` to answer and `Enter` to continue
- Responsive layout for phones and desktop browsers
- Fully offline operation

## Usage

Open `index.html` in a browser. For GitHub Pages, place the contents of this folder at the repository root and publish the repository as a Pages site.

## Files

- `index.html`: Page structure and CSS
- `app.js`: Quiz logic
- `data/countries.js`: Compiled silhouettes and similarity features
- `LICENSE`: Licensing overview and scope
- `LICENSES/`: Full MIT, GPL, and LGPL license texts
- `THIRD_PARTY_NOTICES.md`: Data sources and attribution

## Licensing

This is a mixed-license repository. It must not be described as entirely MIT-licensed.

- `index.html` and `app.js`: MIT License
- `data/countries.js`: LGPL-3.0-or-later
- Natural Earth source material: public domain

The complete scope is stated in `LICENSE`. Keep `data/countries.js`, `LICENSE`, `LICENSES/`, and `THIRD_PARTY_NOTICES.md` together when redistributing the project.

## Disclaimer

The boundary and recognition labels do not express a political position. For readability, some island states are shown using only their principal islands or a simplified arrangement.
