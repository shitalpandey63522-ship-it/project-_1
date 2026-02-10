import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // folder must exist
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // saves file with original name
  },
});

export const upload = multer({ storage: storage });
