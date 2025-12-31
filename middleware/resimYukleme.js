const multer = require("multer");
const path = require("path");

// 1. Depolama Ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Dosyalar nereye yüklenecek? 'uploads' klasörüne.
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Dosya adı ne olsun? (Çakışmayı önlemek için tarih ekliyoruz)
    // Örnek: 17065489-manzara.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 2. Dosya Filtresi (Sadece Resimler)
const fileFilter = (req, file, cb) => {
  // Kabul edilen dosya türleri: jpeg, jpg, png
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true); // Kabul et
  } else {
    cb(new Error("Sadece resim dosyaları yüklenebilir!"), false); // Reddet
  }
};

// 3. Ayarları Dışarı Aktar
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // En fazla 5MB dosya yüklenebilsin
  },
  fileFilter: fileFilter,
});

module.exports = upload;
