// controllers/kullaniciController.js
// Önce modelimizi çağırıyoruz
const Kullanici = require("../models/kullaniciModel");
const bcrypt = require("bcryptjs"); // Şifreleme kütüphanesini çağırdık
const jwt = require("jsonwebtoken"); // <-- 1. YENİ EKLENTİ
// 1. GÜVENLİ KAYIT OLMA (REGISTER)
exports.kullaniciEkle = async (req, res) => {
  try {
    const { ad, email, sifre } = req.body;

    // A) Bu email daha önce kayıt olmuş mu kontrol et?
    const mevcutKullanici = await Kullanici.findOne({ email });
    if (mevcutKullanici) {
      return res.status(400).json({ hata: "Bu email adresi zaten kayıtlı!" });
    }

    // B) Şifreyi Kriptola (Hashing)
    // 10: Tuzlama (Salt) tur sayısıdır. Ne kadar yüksekse o kadar güvenli ama yavaştır. 10 idealdir.
    const sifreliSifre = await bcrypt.hash(sifre, 10);

    // C) Yeni Kullanıcıyı Oluştur (Şifreli haliyle)
    const yeniKullanici = new Kullanici({
      ad,
      email,
      sifre: sifreliSifre, // Veritabanına şifreli halini gönderiyoruz
    });

    await yeniKullanici.save();

    res.status(201).json({
      mesaj: "Kullanıcı güvenli bir şekilde oluşturuldu.",
      kullanici: { ad: yeniKullanici.ad, email: yeniKullanici.email },
      // Şifreyi cevap olarak geri dönmüyoruz, güvenlik kuralı!
    });
  } catch (error) {
    res.status(500).json({ hata: error.message });
  }
};
// 2. GİRİŞ YAPMA (LOGIN) FONKSİYONU
exports.girisYap = async (req, res) => {
  try {
    const { email, sifre } = req.body;

    // A) Kullanıcı var mı?
    const kullanici = await Kullanici.findOne({ email });
    if (!kullanici) {
      return res.status(404).json({ hata: "Kullanıcı bulunamadı!" });
    }

    // B) Şifre doğru mu? (Bcrypt karşılaştırması)
    const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre);
    if (!sifreDogruMu) {
      return res.status(401).json({ hata: "Hatalı şifre!" });
    }

    // C) Şifre doğruysa TOKEN oluştur (Pasaport veriyoruz)
    const token = jwt.sign(
      { id: kullanici._id, email: kullanici.email }, // Token içine gizlenecek bilgi
      process.env.JWT_SECRET, // .env dosyasındaki gizli anahtarımız
      { expiresIn: "1h" } // Token 1 saat sonra geçersiz olsun (Güvenlik)
    );

    // Başarılı cevap dön
    res.status(200).json({
      mesaj: "Giriş başarılı!",
      token: token, // Token'ı kullanıcıya yolluyoruz
    });
  } catch (error) {
    res.status(500).json({ hata: error.message });
  }
};
// 2. Tüm Kullanıcıları Getirme Fonksiyonu
exports.kullanicilariGetir = async (req, res) => {
  try {
    const kullanicilar = await Kullanici.find();
    res.json(kullanicilar);
  } catch (error) {
    res.status(500).json({ hata: error.message });
  }
};

// 3. KULLANICI GÜNCELLEME (UPDATE)
exports.kullaniciGuncelle = async (req, res) => {
  try {
    // Parametre olarak gelen ID'yi alıyoruz (URL'den)
    const guncellenecekID = req.params.id;

    // findByIdAndUpdate: Hem bulur hem günceller
    // 1. parametre: Kim güncellenecek? (ID)
    // 2. parametre: Yeni veriler nedir? (req.body)
    // 3. parametre: { new: true } -> Güncellenmiş halini bize geri ver (yoksa eskisini gösterir)
    const guncellenenKullanici = await Kullanici.findByIdAndUpdate(
      guncellenecekID,
      req.body,
      { new: true }
    );

    if (!guncellenenKullanici) {
      return res.status(404).json({ hata: "Kullanıcı bulunamadı!" });
    }

    res.json({
      mesaj: "Başarıyla güncellendi",
      yeniVeri: guncellenenKullanici,
    });
  } catch (error) {
    res.status(500).json({ hata: "Güncelleme yapılırken hata oluştu." });
  }
};

// 4. KULLANICI SİLME (DELETE)
exports.kullaniciSil = async (req, res) => {
  try {
    const silinecekID = req.params.id;

    // findByIdAndDelete: Bul ve yok et! 💥
    const silinenKullanici = await Kullanici.findByIdAndDelete(silinecekID);

    if (!silinenKullanici) {
      return res.status(404).json({ hata: "Silinecek kullanıcı bulunamadı!" });
    }

    res.json({
      mesaj: "Kullanıcı başarıyla silindi.",
      silinen: { ad: silinenKullanici.ad, email: silinenKullanici.email },
    });
  } catch (error) {
    res.status(500).json({ hata: "Silme işleminde hata oluştu." });
  }
};
