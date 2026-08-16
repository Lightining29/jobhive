const connectDB = require('../src/config/db');
const User = require('../src/models/User');

const emailArg = process.argv[2];

if (!emailArg) {
  console.log('Usage: node scripts/makeAdmin.js <email>');
  process.exit(1);
}

const targetEmail = emailArg.trim().toLowerCase();

connectDB().then(async () => {
  try {
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.error(`❌ User with email "${targetEmail}" not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    user.adminRole = 'super_admin';
    user.permissions = ['all', 'services', 'plans', 'coupons', 'bundles', 'users', 'jobs', 'companies', 'payments', 'reports', 'settings', 'roles', 'notifications'];
    user.emailVerified = true;
    await user.save();

    console.log(`✅ Success! "${user.name}" (${user.email}) is now a Super Admin.`);
    console.log(`You can now log in at /auth/login and visit /admin/dashboard`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating user:', err.message);
    process.exit(1);
  }
});
