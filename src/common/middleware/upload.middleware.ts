import multer from "multer";
import path from "node:path";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtension = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];

    if (allowedExtension.includes(ext)) {
      return cb(null, true);
    }

    return cb(new Error("Unsupported file type"));
  },
});
