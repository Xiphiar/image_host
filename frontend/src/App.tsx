import { useState, useRef } from 'react'
import './App.css'

interface UploadResponse {
  success: boolean;
  filename?: string;
  message?: string;
  error?: string;
  code?: string;
  clientIp?: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, WebP, BMP, SVG)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadedImage(null);
    setImageUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (result.success && result.filename) {
        const imageUrl = `${API_BASE_URL}/files/${result.filename}`;
        setUploadedImage(imageUrl);
        setImageUrl(imageUrl);
      } else {
        if (result.code === 'IP_NOT_WHITELISTED') {
          setError(`Upload not allowed from your IP address (${result.clientIp}). Please contact the administrator to whitelist your IP.`);
        } else {
          setError(result.error || 'Upload failed');
        }
      }
    } catch(err) {
      console.error(err)
      setError('Failed to upload image. Make sure the backend server is running.');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      // Simple feedback - you could add a toast notification here
      alert('URL copied to clipboard!');
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadedImage(null);
    setImageUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Image Host</h1>
        <p>Upload and share your images</p>
      </header>

      <main className="app-main">
        {!uploadedImage ? (
          <div className="upload-section">
            <div 
              className={`upload-area ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <p>Drag and drop an image here, or click to select</p>
                <p className="upload-hint">Supports JPG, PNG, GIF, WebP, BMP, SVG (max 10MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {selectedFile && (
              <div className="file-preview">
                <h3>Selected File:</h3>
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
                
                <div className="upload-actions">
                  <button 
                    onClick={uploadFile} 
                    disabled={uploading}
                    className="upload-btn"
                  >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <button onClick={resetUpload} className="reset-btn">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="result-section">
            <h3>Upload Successful!</h3>
            
            <div className="image-preview">
              <img src={uploadedImage} alt="Uploaded" />
            </div>

            <div className="url-section">
              <label>Image URL:</label>
              <div className="url-input-group">
                <input 
                  type="text" 
                  value={imageUrl || ''} 
                  readOnly 
                  className="url-input"
                />
                <button onClick={copyToClipboard} className="copy-btn">
                  Copy
                </button>
              </div>
            </div>

            <button onClick={resetUpload} className="upload-another-btn">
              Upload Another Image
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
