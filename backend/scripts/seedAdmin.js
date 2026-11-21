const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDatabase } = require('../config/database');
const Admin = require('../models/Admin');

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Admin seeding is disabled in production.');
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running the development admin seed.');
    process.exit(1);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('ADMIN_EMAIL is invalid.');
    process.exit(1);
  }
  if (password.length < 12 || password.length > 128) {
    console.error('ADMIN_PASSWORD must contain 12 to 128 characters.');
    process.exit(1);
  }

  const database = await connectDatabase();
  if (database.status !== 'connected') {
    console.error(`Cannot seed admin: ${database.message}`);
    process.exit(1);
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Development admin already exists; password was not changed.');
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.create({
      name: 'Sapphire Vista Administrator',
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
    });
    console.log('Development admin created. Development credentials must never be used in production.');
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(`Admin seed failed: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
