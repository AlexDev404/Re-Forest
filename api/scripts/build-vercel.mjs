import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'fs';

const FUNC_DIR = '.vercel/output/functions/api.func';

// 1. Bundle the app
await build({
  entryPoints: ['src/vercel.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: `${FUNC_DIR}/index.mjs`,
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
  },
  external: ['sharp'],
});

// 2. Function config
writeFileSync(`${FUNC_DIR}/.vc-config.json`, JSON.stringify({
  runtime: 'nodejs22.x',
  handler: 'index.mjs',
  launcherType: 'Nodejs',
}, null, 2));

// 3. Output config with catch-all route
mkdirSync('.vercel/output/static', { recursive: true });
writeFileSync('.vercel/output/config.json', JSON.stringify({
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/api' },
  ],
}, null, 2));

console.log('Build complete: .vercel/output/');
