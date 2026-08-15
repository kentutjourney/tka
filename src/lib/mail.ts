import nodemailer from 'nodemailer';

// Konfigurasi transporter menggunakan kredensial SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || process.env.SUPERADMIN_EMAIL || 'ziqiraehan1@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendApprovalEmail(toEmail: string, username: string) {
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/pengajar/login';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
          .sublogo { font-size: 13px; opacity: 0.9; margin-top: 4px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
          .badge-approved { display: inline-block; background-color: #ecfdf5; color: #047857; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #a7f3d0; margin-bottom: 20px; }
          .btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; margin: 24px 0; text-align: center; box-shadow: 0 4px 10px rgba(5,150,105,0.25); }
          .info-box { background-color: #f8fafc; border-left: 4px solid #059669; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 13px; color: #475569; }
          .footer { padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f8fafc; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">SD NEGERI KEDUNG JAYA 02</h1>
            <div class="sublogo">Portal Latihan & Try Out TKA SD</div>
          </div>
          
          <div class="content">
            <div class="badge-approved">✓ AKUN DISETUJUI / APPROVED</div>
            <div class="greeting">Halo, Bapak/Ibu Guru @${username}!</div>
            
            <p>
              Kabar baik! Pendaftaran akun Anda sebagai <b>Guru Pengajar</b> pada platform <b>TKA SD Negeri Kedung Jaya 02</b> telah disetujui (ACC) oleh Super Admin.
            </p>
            
            <div class="info-box">
              <b>Informasi Akun Anda:</b><br>
              • Username: <b>@${username}</b><br>
              • Email Terdaftar: <b>${toEmail}</b><br>
              • Status: <b style="color: #059669;">Aktif & Siap Digunakan</b>
            </div>

            <p>
              Sekarang Anda dapat masuk ke dashboard portal pengajar untuk mulai membuat modul mata pelajaran, menginput soal pilihan ganda (A-B-C-D), serta mengajukan modul untuk try out siswa.
            </p>

            <div style="text-align: center;">
              <a href="${portalUrl}" class="btn" target="_blank">Masuk ke Portal Pengajar &rarr;</a>
            </div>

            <p style="font-size: 13px; color: #64748b;">
              Jika tombol di atas tidak dapat diklik, silakan salin dan buka tautan berikut di peramban Anda:<br>
              <a href="${portalUrl}" style="color: #059669;">${portalUrl}</a>
            </p>
          </div>

          <div class="footer">
            Email otomatis dikirim oleh Sistem Portal TKA SDN Kedung Jaya 02.<br>
            Harap tidak membalas email ini secara langsung.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    // Jika EMAIL_APP_PASSWORD belum diisi, kita log dengan jelas
    if (!process.env.EMAIL_APP_PASSWORD && !process.env.GMAIL_APP_PASSWORD) {
      console.warn('[EMAIL WARNING] GMAIL_APP_PASSWORD belum diisi di .env.local. Email fisik belum dapat dikirim ke SMTP Gmail.');
      return { success: false, reason: 'GMAIL_APP_PASSWORD_MISSING' };
    }

    const info = await transporter.sendMail({
      from: `"SDN Kedung Jaya 02" <${process.env.EMAIL_USER || 'ziqiraehan1@gmail.com'}>`,
      to: toEmail,
      subject: `✓ Akun Pengajar TKA SD Anda Telah Disetujui - SDN Kedung Jaya 02`,
      html: htmlContent,
    });

    console.log('[EMAIL SENT SUCCESSFULLY] Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[EMAIL SEND ERROR]', err.message);
    return { success: false, error: err.message };
  }
}
