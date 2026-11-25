# Blackjack Trainer

## Local development

Use Node.js 24 with npm. This Mac has a project-local copy in `.node-runtime/`. To use it, run `export PATH="$PWD/.node-runtime/bin:$PATH"` from the project directory in each new terminal session. On another machine, use a standard Node.js 24 installation.

From the project directory, run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Press Ctrl+C in the terminal to stop the server.

- `npm run build` checks TypeScript and bundles the app into `dist/`.
- `npm test` runs Vitest. The starter allows an empty test suite until the first game or strategy tests are added.
