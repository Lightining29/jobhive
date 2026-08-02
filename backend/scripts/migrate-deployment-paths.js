/**
 * scripts/migrate-deployment-paths.js
 *
 * One-time migration: updates Deployment.deploymentPath records
 * from the old flat structure  (deployments/{slug}/)
 * to the new current/ structure (deployments/{slug}/current/)
 *
 * Safe to re-run — skips records that already point to current/.
 *
 * Usage:
 *   node scripts/migrate-deployment-paths.js
 */
require('dotenv').config();
const path = require('path');
const fs   = require('fs');
const mongoose = require('mongoose');

const DEPLOYMENTS_DIR = path.join(__dirname, '..', 'deployments');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[migrate] Connected to MongoDB');

  const Deployment = require('../src/models/Deployment');
  const all = await Deployment.find({}).lean();
  console.log(`[migrate] Found ${all.length} deployment(s)`);

  let updated = 0;
  let skipped = 0;

  for (const dep of all) {
    const currentPath = path.join(DEPLOYMENTS_DIR, dep.slug, 'current');

    // Already migrated
    if (dep.deploymentPath && dep.deploymentPath.endsWith('current')) {
      console.log(`  [skip]   ${dep.slug} — already points to current/`);
      skipped++;
      continue;
    }

    // Ensure current/ exists on disk
    if (!fs.existsSync(currentPath)) {
      // Try to create it from old slug root files
      const slugRoot = path.join(DEPLOYMENTS_DIR, dep.slug);
      if (fs.existsSync(slugRoot)) {
        fs.mkdirSync(currentPath, { recursive: true });
        const items = fs.readdirSync(slugRoot).filter(n => !/^v\d+$/.test(n) && n !== 'current');
        for (const item of items) {
          const src  = path.join(slugRoot, item);
          const dest = path.join(currentPath, item);
          if (typeof fs.cpSync === 'function') {
            fs.cpSync(src, dest, { recursive: true });
          } else {
            fs.copyFileSync(src, dest);
          }
        }
        console.log(`  [copy]   ${dep.slug} — copied ${items.length} items to current/`);
      } else {
        console.log(`  [warn]   ${dep.slug} — slug dir missing, skipping disk copy`);
      }
    }

    // Update DB
    await Deployment.updateOne(
      { _id: dep._id },
      { $set: { deploymentPath: currentPath } }
    );
    console.log(`  [updated] ${dep.slug} → ${currentPath}`);
    updated++;
  }

  console.log(`\n[migrate] Done. Updated: ${updated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('[migrate] Error:', err.message);
  process.exit(1);
});
