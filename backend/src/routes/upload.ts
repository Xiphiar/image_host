import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateFileHash, getFileExtension, isValidImageExtension } from '../utils/fileHash';
import { ipWhitelistMiddleware } from '../middleware/ipWhitelist';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const extension = getFileExtension(file.originalname);
    if (isValidImageExtension(extension)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.post('/', ipWhitelistMiddleware, upload.single('image') as any, (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalExtension = getFileExtension(req.file.originalname);
    if (!isValidImageExtension(originalExtension)) {
      return res.status(400).json({ error: 'Invalid file type. Only image files are allowed.' });
    }

    // Generate hash of file content
    const fileHash = generateFileHash(req.file.buffer);
    const filename = `${fileHash}.${originalExtension}`;
    const filepath = path.join(uploadsDir, filename);

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      return res.json({
        success: true,
        filename: filename,
        message: 'File already exists'
      });
    }

    // Save file to disk
    fs.writeFileSync(filepath, req.file.buffer);

    res.json({
      success: true,
      filename: filename,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 