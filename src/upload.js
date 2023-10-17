import path from "path";
import { cwd } from "node:process";
import multer from "multer";
import slugify from "slugify";
import jwt from "jsonwebtoken";

export default class Upload {
  constructor(pathName = "uploads") {
    this.uploadDir = path.join(cwd(), pathName);

    const allowedFileTypes = [
      "image/png",
      "image/jpeg",
      "video/mp4",
      "video/webm",
    ]; // İzin verilen dosya türleri

    const fileFilter = (req, file, cb) => {
      if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true); // Dosya türü izin verilen türler içinde ise true döndür
      } else {
        cb(new Error("Geçersiz dosya türü")); // İzin verilmeyen türler için hata döndür
      }
    };

    this.storage = multer.diskStorage({
      destination: this.uploadDir,
      filename: (req, file, cb) => {
        const cleanedFileName = slugify(file.originalname, { lower: true });
        const fileName = Date.now() + "_" + cleanedFileName;
        cb(null, fileName);
      },
    });

    this.upload = multer({
      storage: this.storage,
      fileFilter: fileFilter,
    }).single("file");
  }

  uploadFile = async (req, res) => {
    this.upload(req, res, async (error) => {
      if (error)
        return res.json({
          success: false,
          message: error.message || String(error),
        });

      // Dosya işleme tamamlandığında çözülen bir Promise döndür
      const fileName = req.file.filename;
      const token = jwt.sign({ fileName }, "gizli-anahtar");
      const file = {
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `http://localhost:3000/uploads/${token}`,
        timestamp: Date.now(),
      };

      return res.json({
        success: true,
        message: "Dosya başarıyla işlendi",
        file: file,
      });
    });
  };

  getFile = async (req, res) => {
    const token = req.params.token;
    jwt.verify(token, "gizli-anahtar", (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Geçersiz token" });
      }
      // Doğrulanmışsa, dosya adını kullanarak dosyayı yolla
      const filePath = path.join(cwd(), "uploads", decoded.fileName);
      res.sendFile(filePath);
    });
  };
}
