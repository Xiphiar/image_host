import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Path to whitelist file (mounted in Docker or in project root for development)
const WHITELIST_FILE_PATH = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../../whitelist.txt')
  : path.join(__dirname, '../../../whitelist.txt');

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const clientIp = req.connection.remoteAddress || req.socket.remoteAddress;
  
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp && typeof realIp === 'string') {
    return realIp;
  }
  
  return clientIp || '';
}

function loadWhitelist(): string[] {
  try {
    if (!fs.existsSync(WHITELIST_FILE_PATH)) {
      return []; // No whitelist file means allow all
    }
    
    const content = fs.readFileSync(WHITELIST_FILE_PATH, 'utf8').trim();
    
    if (!content) {
      return []; // Empty file means allow all
    }
    
    // Parse comma-separated IPs and trim whitespace
    // Also handle comments (lines starting with #)
    const cleanContent = content
      .split('\n')
      .map(line => line.split('#')[0].trim()) // Remove comments
      .filter(line => line.length > 0)
      .join(',');
    
    return cleanContent
      .split(',')
      .map(ip => ip.trim())
      .filter(ip => ip.length > 0);
    
  } catch (error) {
    console.error('Error reading whitelist file:', error);
    return []; // On error, allow all (fail open)
  }
}

export function ipWhitelistMiddleware(req: Request, res: Response, next: NextFunction): void | Response {
  const whitelist = loadWhitelist();
  
  // If no whitelist or empty whitelist, allow all
  if (whitelist.length === 0) {
    return next();
  }
  
  const clientIp = getClientIp(req);
  console.log(`Upload attempt from IP: ${clientIp}`);
  
  // Check if client IP is in whitelist
  const isWhitelisted = whitelist.some(whitelistedIp => {
    // Handle IPv4 and IPv6 formats
    if (clientIp.includes('::ffff:') && !whitelistedIp.includes('::ffff:')) {
      // Client IP is IPv4-mapped IPv6, compare with IPv4 part
      const ipv4 = clientIp.replace('::ffff:', '');
      return ipv4 === whitelistedIp;
    }
    return clientIp === whitelistedIp;
  });
  
  if (!isWhitelisted) {
    console.log(`IP ${clientIp} not whitelisted. Allowed IPs: ${whitelist.join(', ')}`);
    return res.status(403).json({
      error: 'Upload not allowed from your IP address',
      code: 'IP_NOT_WHITELISTED',
      clientIp: clientIp
    });
  }
  
  next();
} 