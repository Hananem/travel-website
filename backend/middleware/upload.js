const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

console.log('=== MULTER CONFIG DEBUG ===');
console.log('Cloudinary config:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? 'SET' : 'NOT SET',
  api_secret: cloudinary.config().api_secret ? 'SET' : 'NOT SET'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "items", 
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "avif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }] // optional
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - file:', file);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = upload;