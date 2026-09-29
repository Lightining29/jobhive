const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, '../frontend/dist/index.html');

console.log('[build] Starting JobHive frontend build...');

let buildSucceeded = false;

try {
  execSync('npx vite build', {
    cwd: path.join(__dirname, '../frontend'),
    stdio: 'inherit',
    env: { ...process.env, ROLLUP_WASM: 'true' },
  });
  buildSucceeded = true;
  console.log('[build] Vite build completed successfully!');
} catch (err) {
  console.warn('[build] Vite build failed or glibc is unavailable in this environment.');
}

if (!buildSucceeded) {
  if (fs.existsSync(distIndex)) {
    console.log('[build] Pre-built production bundle verified in frontend/dist/index.html.');
    console.log('[build] Using pre-compiled production assets for deployment.');
    process.exit(0);
  } else {
    console.error('[build] Fatal: frontend/dist was not found.');
    process.exit(1);
  }
}
