# Image Host

A simple, modern image hosting application with a React frontend and Express.js backend.

## Features

- **Drag & Drop Upload**: Modern interface with drag-and-drop file upload
- **Image Preview**: Preview uploaded images directly in the browser
- **URL Sharing**: Get shareable URLs for uploaded images with copy-to-clipboard
- **File Validation**: Client and server-side validation for image files only
- **Hash-based Storage**: Prevents duplicate files using SHA-256 hashing
- **Responsive Design**: Works on desktop and mobile devices
- **CORS Support**: Backend configured for cross-origin requests

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for development and building
- Modern CSS with responsive design

### Backend
- Express.js with TypeScript
- Multer for file uploads
- SHA-256 hashing for file deduplication
- CORS enabled

## Project Structure

```
image_host/
├── frontend/          # React frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express.js backend API
│   ├── src/
│   ├── uploads/       # Uploaded images (created at runtime)
│   └── package.json
└── README.md
```

## Quick Start

### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker:

```bash
# Clone and navigate to the project
cd image_host

# Start both services with Docker Compose
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3001

To stop the services:
```bash
docker-compose down
```

### Option 2: Manual Setup

#### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server will start on `http://localhost:3001`

#### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### Usage

1. Open `http://localhost:5173` in your browser
2. Drag and drop an image file or click to select
3. Click "Upload Image" to upload
4. Copy the generated URL to share your image

## API Endpoints

- `POST /upload` - Upload an image file
- `GET /files/:filename` - Serve uploaded images
- `GET /health` - Health check

## Supported File Types

- JPG/JPEG
- PNG
- GIF
- WebP
- BMP
- SVG

## Configuration

- **File Size Limit**: 10MB
- **Backend Port**: 3001
- **Frontend Dev Port**: 5173 (Vite default)

## Development

Both frontend and backend support hot reloading during development.

### Backend Development
```bash
cd backend
npm run dev  # Uses ts-node for hot reloading
```

### Frontend Development
```bash
cd frontend
npm run dev  # Uses Vite dev server
```

## Docker

### Prerequisites
- Docker
- Docker Compose

### Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Remove all containers and volumes
docker-compose down -v
```

### Docker Architecture

- **Frontend**: Multi-stage build with Node.js for building and Nginx for serving
- **Backend**: Node.js container with TypeScript compilation
- **Volumes**: `./uploads` directory mounted to preserve uploaded images
- **Network**: Internal Docker network for service communication

## Production Build

### Manual Build (Without Docker)

#### Backend
```bash
cd backend
npm run build  # Compiles TypeScript
npm start      # Runs compiled JavaScript
```

#### Frontend
```bash
cd frontend
npm run build  # Creates optimized build in dist/
```

## File Storage

### Storage Location
- **Development**: `backend/uploads/`
- **Docker**: `./uploads/` (mounted volume in project root)

### File Naming
Images are stored with filenames based on SHA-256 hash:
- Format: `{hash}.{extension}`
- Example: `a1b2c3d4e5f6...xyz.jpg`
- Prevents duplicates and naming conflicts
- Extensions are normalized to lowercase

### File Persistence
When using Docker, uploaded files are automatically persisted in the `./uploads` directory on your host machine. This means:
- Files survive container restarts
- Files are shared between development and production environments
- Easy backup and migration of uploaded content

## Security Features

- File type validation on both client and server
- File size limits to prevent abuse
- Hash-based naming prevents directory traversal
- CORS properly configured
- **IP Whitelist**: Optional IP-based access control for uploads

## IP Whitelist Configuration

You can optionally restrict uploads to specific IP addresses by creating a `whitelist.txt` file in the project root directory.

### Setup

1. **Create whitelist file**:
   ```bash
   # Copy the example file
   cp whitelist.txt.example whitelist.txt
   
   # Edit with your allowed IPs
   nano whitelist.txt
   ```

2. **Add IP addresses** (comma-separated):
   ```
   192.168.1.100, 10.0.0.5, 172.16.0.10
   ```

3. **Apply changes**:
   - **Development**: Just save the file, changes apply immediately
   - **Docker**: Restart the container to reload the whitelist
     ```bash
     docker-compose restart backend
     ```

### Behavior

- **No file**: All IPs allowed (default behavior)
- **Empty file**: All IPs allowed
- **File with IPs**: Only listed IPs can upload
- **Invalid IP**: Upload denied with 403 Forbidden status

### Supported Formats

- IPv4: `192.168.1.100`
- IPv6: `::1`, `2001:db8::1`
- Localhost: `127.0.0.1`, `::1`

### Examples

```bash
# Allow only localhost
127.0.0.1, ::1

# Multiple specific IPs
203.0.113.1, 198.51.100.1, 192.0.2.1
```

**Note**: The whitelist file supports comments (lines starting with `#`) and whitespace is automatically trimmed. 