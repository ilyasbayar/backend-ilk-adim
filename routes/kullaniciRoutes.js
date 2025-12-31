// routes/kullaniciRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
// Controller'ı çağırıyoruz
const kullaniciController = require("../controllers/kullaniciController");

// '/kayit' adresine POST gelirse, controller'daki kullaniciEkle çalışsın
router.post("/kayit", kullaniciController.kullaniciEkle);

// YENİ EKLENEN SATIR: Giriş Rotası
router.post("/giris", kullaniciController.girisYap);

// '/listele' adresine GET gelirse, controller'daki kullanicilariGetir çalışsın
router.get("/listele", authMiddleware, kullaniciController.kullanicilariGetir);

// DİKKAT: ':id' yazarak buraya değişken bir ID geleceğini belirtiyoruz.
// Örn: /api/guncelle/65a8c... gibi
router.put(
  "/guncelle/:id",
  authMiddleware,
  kullaniciController.kullaniciGuncelle
);

// DELETE metodu ile çalışacak
router.delete("/sil/:id", authMiddleware, kullaniciController.kullaniciSil);

module.exports = router;
