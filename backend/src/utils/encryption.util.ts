import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Derive key from encryption key in environment
function getKey(): Buffer {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    // Use PBKDF2 to derive a proper key
    const salt = Buffer.from('booking-system-salt'); // Static salt for consistency
    return crypto.pbkdf2Sync(encryptionKey, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive text data
 * @param text - Plain text to encrypt
 * @returns Encrypted text in format: iv:encrypted:authTag
 */
export function encrypt(text: string): string {
    try {
        const key = getKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Return format: iv:encrypted:authTag
        return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt encrypted text data
 * @param encryptedText - Encrypted text in format: iv:encrypted:authTag
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
    try {
        const key = getKey();
        const parts = encryptedText.split(':');

        if (parts.length !== 3) {
            throw new Error('Invalid encrypted text format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const authTag = Buffer.from(parts[2], 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Generate a random encryption key (for initial setup)
 * @returns Random hex string suitable for ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
}
