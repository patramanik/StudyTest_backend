const multer = require("multer");
const path = require("path");
const generateCode = require("../utils/generateCode");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads");
  },
  filename: function (req, file, callback) {
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const fileName = originalName.replace(extension, "");
    const compressedFilename = fileName.split(" ").join("_");
    const lowercaseFilename = compressedFilename.toLocaleLowerCase();
    const code = generateCode(12);
    const newFilename = `${lowercaseFilename}-${code}${extension}`;
    callback(null, newFilename);
  },
});

const fileFilter = (req, file, callback) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
    if (mimetype && extname) {
      return callback(null, true);
    } else {
      callback(new Error('Only images are allowed'));
    }
  };

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

module.exports = upload;
