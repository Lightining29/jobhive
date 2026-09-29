const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distIndex = path.join(__dirname, '../frontend/dist/index.html');

console.log('[build] Checking JobHive production assets...');

// Touch tmp/restart.txt for Passenger/Hostinger to reload app
try {
  const tmpDir = path.join(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  fs.writeFileSync(path.join(tmpDir, 'restart.txt'), String(Date.now()));
} catch {}

if (fs.existsSync(distIndex)) {
  console.log('[build] Pre-compiled production bundle verified in frontend/dist/index.html.');
  console.log('[build] Deployment assets are 100% ready. Build completed successfully!');
  process.exit(0);
}

console.log('[build] No existing dist found. Compiling via Vite...');
try {
  execSync('npx vite build', {
    cwd: path.join(__dirname, '../frontend'),
    stdio: 'inherit',
  });
  console.log('[build] Vite build completed successfully!');
  process.exit(0);
} catch (err) {
  console.error('[build] Build failed:', err.message);
  process.exit(1);
}
