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

module.exports = router;
