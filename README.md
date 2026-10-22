# AdvanceGuitar

An interactive guitar ear-training and fretboard practice app. The 28-day first stage connects what you hear with fretboard positions, melodic phrases, and movable E/Em chord shapes. Each daily session takes about 60 minutes. The interface is available in English (default) and German; lesson text is currently in Chinese.

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal. Microphone recognition requires `localhost` or HTTPS and starts only after you grant permission.

## Quality checks

```bash
npm run check
npm run test:e2e
```

`npm run check` validates the 28 curriculum Markdown files, runs ESLint and unit tests, and creates a production build. End-to-end tests cover the main desktop and mobile flows.

## Project structure

- `content/stage-1/`: 28 daily Markdown lessons and their exercise bindings
- `src/audio/`: Web Audio synthesis, tuning references, metronome, and local pitch detection
- `src/data/`: Deterministic question pools and a 300-phrase bank
- `src/progress/`: Local progress, import/export, adaptive practice, and stage assessment
- `src/pages/`: Home, curriculum, daily lessons, exercises, library, progress, and settings

Choose your own songs for practice. The app does not provide, download, or store copyrighted recordings; it only lets you record song locations, notes you find, and reflections.
