// controllers/kullaniciController.js
// Önce modelimizi çağırıyoruz
const Kullanici = require("../models/kullaniciModel");
const bcrypt = require("bcryptjs"); // Şifreleme kütüphanesini çağırdık
const jwt = require("jsonwebtoken"); // <-- 1. YENİ EKLENTİ
const crypto = require("crypto"); // Rastgele kod üretmek için (Node.js içinde var, kurmana gerek yok)
const emailGonder = require("../utils/emailGonder"); // Az önce yazdığımız postacı
//--------------------------------------------------------------------
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
//--------------------------------------------------------------------
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
//--------------------------------------------------------------------
// 2. Tüm Kullanıcıları Getirme Fonksiyonu
exports.kullanicilariGetir = async (req, res) => {
  try {
    const kullanicilar = await Kullanici.find();
    res.json(kullanicilar);
  } catch (error) {
    res.status(500).json({ hata: error.message });
  }
};
//--------------------------------------------------------------------
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
//--------------------------------------------------------------------
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
//--------------------------------------------------------------------
// 5. PROFİL RESMİ YÜKLEME
exports.profilResmiYukle = async (req, res) => {
  try {
    // Multer dosyayı yüklediyse req.file içinde bilgileri vardır
    if (!req.file) {
      return res.status(400).json({ hata: "Lütfen bir resim dosyası seçin!" });
    }

    // Giriş yapmış olan kullanıcının ID'sini alıyoruz (Auth Middleware'den geliyor)
    const userId = req.user.id;

    // Resmin yolunu (path) oluşturuyoruz. Örn: uploads/17823...jpg
    const resimYolu = req.file.path;

    // Veritabanında güncelleme yapıyoruz
    const guncellenenKullanici = await Kullanici.findByIdAndUpdate(
      userId,
      { profilResmi: resimYolu }, // Sadece resim alanını güncelle
      { new: true }
    );

    res.json({
      mesaj: "Profil resmi başarıyla yüklendi! 📸",
      resimYolu: resimYolu,
      kullanici: {
        ad: guncellenenKullanici.ad,
        profilResmi: guncellenenKullanici.profilResmi,
      },
    });
  } catch (error) {
    res.status(500).json({ hata: "Resim yüklenirken hata oluştu." });
  }
};
// --------------------------------------------------------------------------

// 6. ŞİFREMİ UNUTTUM (FORGOT PASSWORD)
exports.sifremiUnuttum = async (req, res) => {
  try {
    // 1. Kullanıcıyı e-posta ile bul
    const kullanici = await Kullanici.findOne({ email: req.body.email });
    if (!kullanici) {
      return res
        .status(404)
        .json({ hata: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı." });
    }

    // 2. Rastgele bir Token üret (Reset Token)
    // 20 karakterlik rastgele bir kod oluşturuyoruz
    const resetToken = crypto.randomBytes(20).toString("hex");

    // 3. Token'ı ve Süresini Veritabanına Kaydet
    kullanici.resetPasswordToken = resetToken;
    kullanici.resetPasswordExpires = Date.now() + 3600000; // 1 Saat geçerli (ms cinsinden)

    await kullanici.save();

    // 4. Sıfırlama Linkini Oluştur
    // Gerçek hayatta burası sitenin adresi olur (örn: www.site.com/reset/...)
    const resetUrl = `http://localhost:3000/api/sifre-sifirla/${resetToken}`;

    // 5. E-postayı Gönder
    const mesaj = `Şifrenizi sıfırlamak için lütfen aşağıdaki linke tıklayın:\n\n${resetUrl}\n\nBu işlemi siz yapmadıysanız lütfen dikkate almayın.`;

    try {
      await emailGonder({
        email: kullanici.email,
        subject: "Şifre Sıfırlama İsteği",
        message: mesaj,
      });

      res.status(200).json({
        mesaj: `E-posta gönderildi: ${kullanici.email}. Lütfen gelen kutunuzu kontrol edin.`,
      });
    } catch (error) {
      // Eğer mail gitmezse, veritabanına kaydettiğimiz token'ı geri siliyoruz
      kullanici.resetPasswordToken = undefined;
      kullanici.resetPasswordExpires = undefined;
      await kullanici.save();

      return res.status(500).json({
        hata: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.",
      });
    }
  } catch (error) {
    res.status(500).json({ hata: "Bir hata oluştu: " + error.message });
  }
};
//--------------------------------------------------------------------
// 7. ŞİFREYİ SIFIRLAMA (RESET PASSWORD) - LİNKE TIKLAYINCA ÇALIŞIR
exports.sifreyiSifirla = async (req, res) => {
  try {
    // 1. Token'ı URL'den alıyoruz (params)
    const gelenToken = req.params.token;
    const { yeniSifre } = req.body;

    // 2. Bu token'a sahip ve süresi dolmamış kullanıcıyı bul
    // $gt: Greater Than (Büyükse) demektir. Yani son kullanma tarihi şu andan büyük olmalı.
    const kullanici = await Kullanici.findOne({
      resetPasswordToken: gelenToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!kullanici) {
      return res
        .status(400)
        .json({ hata: "Geçersiz veya süresi dolmuş token!" });
    }

    // 3. Yeni şifreyi kriptola (Hash)
    const sifreliYeniSifre = await bcrypt.hash(yeniSifre, 10);

    // 4. Bilgileri güncelle
    kullanici.sifre = sifreliYeniSifre;
    kullanici.resetPasswordToken = undefined; // Token'ı sil (tek kullanımlık olsun)
    kullanici.resetPasswordExpires = undefined;

    await kullanici.save();

    res
      .status(200)
      .json({
        mesaj:
          "Şifreniz başarıyla değiştirildi! Artık yeni şifrenizle giriş yapabilirsiniz.",
      });
  } catch (error) {
    res
      .status(500)
      .json({ hata: "Şifre değiştirilirken hata oluştu: " + error.message });
  }
};
