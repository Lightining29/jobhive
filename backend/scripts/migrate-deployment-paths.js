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

// Recursive directory copy fallback for older Node versions
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('[migrate] Connected to MongoDB');

  const Deployment = require('../src/models/Deployment');
  const all = await Deployment.find({}).lean();
  console.log(`[migrate] Found ${all.length} deployment(s)`);

  const bulkOps = [];
  let copiedCount = 0;
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
            copyRecursiveSync(src, dest);
          }
        }
        console.log(`  [copy]   ${dep.slug} — copied ${items.length} items to current/`);
        copiedCount++;
      } else {
        console.log(`  [warn]   ${dep.slug} — slug dir missing, skipping disk copy`);
      }
    }

    // Queue update
    bulkOps.push({
      updateOne: {
        filter: { _id: dep._id },
        update: { $set: { deploymentPath: currentPath } }
      }
    });
    console.log(`  [queued]  ${dep.slug} → ${currentPath}`);
  }

  if (bulkOps.length > 0) {
    const result = await Deployment.bulkWrite(bulkOps);
    console.log(`\n[migrate] Bulk updates completed. Modified count: ${result.modifiedCount}`);
  }

  console.log(`\n[migrate] Done. Copied/Created: ${copiedCount}, Skipped: ${skipped}`);
}

main()
  .catch(err => {
    console.error('[migrate] Error:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log('[migrate] Disconnected from MongoDB');
  });
