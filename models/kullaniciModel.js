// models/kullaniciModel.js
const mongoose = require("mongoose");

const KullaniciSchema = new mongoose.Schema({
  //---------------------------------------------------
  ad: {
    type: String,
    required: true, // İsim girilmesi zorunlu olsun
  },
  //---------------------------------------------------
  email: {
    type: String,
    required: true,
    unique: true, // Aynı email ile ikinci kez kayıt olunamaz!
  },
  //---------------------------------------------------
  sifre: { type: String, required: true }, // Şifreyi şifrelenmiş (Hash) saklayacağız
  //---------------------------------------------------
  // YENİ EKLENEN ALAN:
  profilResmi: {
    type: String,
    default: "default.jpg", // Resim yüklemezse varsayılan bu olsun
  },
  // YENİ EKLENEN KISIMLAR:------------------------------------
  resetPasswordToken: String, // Şifre sıfırlama kodu
  resetPasswordExpires: Date, // Kodun son kullanma tarihi
  //---------------------------------------------------
  tarih: { type: Date, default: Date.now },
});

// Modeli dışarıya açıyoruz ki başka dosyalarda kullanabilelim
module.exports = mongoose.model("Kullanici", KullaniciSchema);
