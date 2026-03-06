import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY = process.env.ENCRYPTION_KEY;

export function encrypt(text: string): string {
	if (!KEY) {
		if (process.env.NODE_ENV === 'production') {
			throw new Error('ENCRYPTION_KEY is not set');
		}
		return text; // Fallback for dev if key is missing
	}

	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);

	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const authTag = cipher.getAuthTag().toString('hex');

	// Format: iv:authTag:encrypted
	return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
	if (!KEY) {
		if (process.env.NODE_ENV === 'production') {
			throw new Error('ENCRYPTION_KEY is not set');
		}
		return encryptedData; // Fallback for dev
	}

	const parts = encryptedData.split(':');
	if (parts.length !== 3) {
		// Not encrypted or wrong format, return as is (could be legacy plain text)
		return encryptedData;
	}

	const [ivHex, authTagHex, encryptedText] = parts;
	const iv = Buffer.from(ivHex, 'hex');
	const authTag = Buffer.from(authTagHex, 'hex');
	const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);

	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}
