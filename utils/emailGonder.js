const nodemailer = require("nodemailer");

const emailGonder = async (options) => {
  // 1. Transporter (Taşıyıcı) Oluştur
  // Bu, maili taşıyan postacıdır.
  // Test için 'Ethereal' servisini kullanıyoruz.
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "wilber.monahan@ethereal.email", // Burayı birazdan değiştireceğiz
      pass: "DfnVCWMEyhh235wrNN", // Burayı birazdan değiştireceğiz
    },
  });

  // 2. Mail Seçeneklerini Ayarla
  const mailOptions = {
    from: '"Node Proje Destek" <destek@proje.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.message (İstersek HTML de gönderebiliriz)
  };

  // 3. Maili Gönder
  await transporter.sendMail(mailOptions);
};

module.exports = emailGonder;
