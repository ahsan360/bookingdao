const crypto = require('crypto');

// Generate a secure 32-byte encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('\n==============================================');
console.log('  Generated Encryption Key');
console.log('==============================================\n');
console.log('Copy this key and paste it in your .env file as ENCRYPTION_KEY:\n');
console.log(encryptionKey);
console.log('\n==============================================\n');
