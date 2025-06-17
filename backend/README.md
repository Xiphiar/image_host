# Image Host Backend

A simple Express.js/TypeScript backend for image hosting with file upload and static file serving.

## Features

- Upload image files (JPG, PNG, GIF, WebP, BMP, SVG)
- Hash-based file naming to prevent duplicates
- File size limit (10MB)
- CORS enabled for all origins
- Static file serving

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### POST /upload
Upload an image file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'image' field

**Response:**
```json
{
  "success": true,
  "filename": "abc123def456.jpg",
  "message": "File uploaded successfully"
}
```

### GET /files/:filename
Get a static image file.

**Request:**
- Method: GET
- URL: `/files/{filename}`

**Response:**
- Image file with appropriate Content-Type headers
- CORS headers enabled

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

## Configuration

- **Port**: 3001 (default) or set via PORT environment variable
- **Upload Directory**: `uploads/` (created automatically)
- **File Size Limit**: 10MB
- **Allowed File Types**: JPG, JPEG, PNG, GIF, WebP, BMP, SVG
- **IP Whitelist**: Optional `whitelist.txt` file for IP-based access control

## File Storage

Files are stored in the `uploads/` directory with names in the format:
`{sha256_hash}.{lowercase_extension}`

This ensures:
- No duplicate files (same content = same hash)
- No naming conflicts
- Consistent file extensions 