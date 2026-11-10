#!/usr/bin/env node
// Generate an ADMIN_PASSWORD_HASH / STAFF_PASSWORD_HASH value.
// Usage: node scripts/hash_password.js 'your-strong-password'
// Also prints a random SESSION_SECRET you can use.
const crypto = require('crypto');

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: node scripts/hash_password.js "<password of at least 12 characters>"');
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64);
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString('hex')}:${hash.toString('hex')}`);
console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString('base64url')}`);
