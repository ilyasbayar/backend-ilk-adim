const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // 1. İsteğin Header (Başlık) kısmından token'ı alıyoruz.
  // Standart olarak token "Authorization" başlığı altında gönderilir.
  const token = req.header("Authorization");

  // 2. Token hiç yoksa içeri alma!
  if (!token) {
    return res.status(401).json({ hata: "Erişim Reddedildi! Token gerekli." });
  }

  try {
    // 3. Token'ı "Bearer " kelimesinden temizle (Eğer varsa)
    // Genelde token "Bearer eyJhb..." şeklinde gelir. Biz sadece kodu istiyoruz.
    const tokenNet = token.replace("Bearer ", "");

    // 4. Token'ın şifresini çöz ve doğrula
    const dogrulanmisKullanici = jwt.verify(tokenNet, process.env.JWT_SECRET);

    // 5. Doğrulama başarılıysa, kullanıcı bilgisini isteğe ekle
    req.user = dogrulanmisKullanici;

    // 6. Kapıyı aç, sıradaki işleme (Controller) geç
    next();
  } catch (error) {
    res.status(400).json({ hata: "Geçersiz veya süresi dolmuş Token!" });
  }
};
