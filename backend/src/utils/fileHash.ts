import * as crypto from 'crypto';

export function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? ext.toLowerCase() : '';
}

export const ALLOWED_IMAGE_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'
];

export function isValidImageExtension(extension: string): boolean {
  return ALLOWED_IMAGE_EXTENSIONS.includes(extension.toLowerCase());
} 