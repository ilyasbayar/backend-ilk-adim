const express = require("express");
const mongoose = require("mongoose"); // 1. Mongoose'u çağırdık
const cors = require("cors");
// 1. .env dosyasını okumasını söylüyoruz (En üste yakın olmalı)
require("dotenv").config();
const kullaniciRoutes = require("./routes/kullaniciRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// --- VERİTABANI BAĞLANTISI ---
// Buraya kendi aldığın linki yapıştır. <password> kısmını silip şifreni yaz.
const baglantiLinki = process.env.MONGO_URI;

mongoose
  .connect(baglantiLinki)
  .then(() => console.log("✅ Veritabanına Başarıyla Bağlanıldı!"))
  .catch((hata) => console.log("❌ Bağlantı Hatası:", hata));

// YÖNLENDİRMELER
// Artık tüm kullanıcı işlemleri için ana yol '/api' olsun.
// Yani: localhost:3000/api/kayit veya localhost:3000/api/listele
app.use("/api", kullaniciRoutes);

// Portu da gizli dosyadan çekiyoruz
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu MVC yapısıyla çalışıyor: http://localhost:${PORT}`);
});
