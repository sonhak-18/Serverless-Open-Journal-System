export const prerender = false;

import type { APIRoute } from 'astro';
import { getDbSettings } from '../../lib/db';
import { verifySession } from '../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const d1 = (locals as any)?.runtime?.env?.DB;
    const kv = (locals as any)?.runtime?.env?.KV;

    const session = await verifySession(request, kv);
    if (!session) {
      return new Response(JSON.stringify({ success: false, error: 'Akses ditolak: Anda harus login sebagai admin redaksi.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json().catch(() => ({}));
    const settings = await getDbSettings(d1);
    const apiKey = body.apiKey || (locals as any)?.runtime?.env?.RESEND_API_KEY || (settings.submission as any)?.resendApiKey;
    const targetEmail = body.email || settings.submission?.email || 'redaksi@praniti.or.id';

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Resend API Key masih kosong. Masukkan kunci API (format: re_xxxxxx) di kolom Resend API Key terlebih dahulu.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const testPayload = {
      from: 'Editorial Submission Test <noreply@jurnal-anda.ac.id>',
      to: [targetEmail],
      reply_to: targetEmail,
      subject: `[Email Test] Uji Coba Pengiriman Resend API (${new Date().toLocaleTimeString('id-ID')})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 640px; margin: 24px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 40, 78, 0.08);">
          <div style="background-color: #0f284e; padding: 26px 28px; border-bottom: 4px solid #c89b3c;">
            <div style="background-color: #ffffff; padding: 8px 16px; border-radius: 6px; display: inline-block; margin-bottom: 12px;">
              <img src="/images/logo.png" alt="Logo Jurnal" width="140" style="display: block; border: 0;" />
            </div>
            <div style="font-size: 10.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #c89b3c; margin-bottom: 4px;">
              ORGANISASI RISET DAN PUBLIKASI ILMIAH PRANITI
            </div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #ffffff; font-family: Georgia, serif;">
              Sistem Penerbitan Jurnal Terbuka
            </h2>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; font-family: 'Courier New', Courier, monospace;">
              e-ISSN: 2999-7127 | p-ISSN: 2999-7119 | Peer-Reviewed &amp; Open Access
            </div>
          </div>
          <div style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 12px 28px; font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
            &#10003; Pengujian Resend API &mdash; Terhubung Berhasil
          </div>
          <div style="padding: 28px; font-size: 14px; color: #334155;">
            <p style="margin-top: 0;">Halo Dewan Redaksi,</p>
            <p>Surel uji coba ini mengonfirmasi bahwa <strong>Resend API Key</strong> dan pengirim resmi terverifikasi (<code>noreply@jurnal-anda.ac.id</code>) telah terhubung dengan sempurna ke portal penerimaan naskah jurnal.</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; margin: 18px 0; font-size: 13px;">
              <div style="margin-bottom: 4px;"><strong>Alamat Penerima:</strong> ${targetEmail}</div>
              <div style="margin-bottom: 4px;"><strong>Identitas Pengirim:</strong> noreply@jurnal-anda.ac.id (Domain Terverifikasi)</div>
              <div style="margin-bottom: 4px;"><strong>Waktu Pengujian:</strong> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</div>
              <div><strong>Status Integrasi:</strong> <span style="color: #059669; font-weight: 700;">Aktif &amp; Siap Produksi</span></div>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Setiap kali calon penulis mengirimkan naskah online, berkas dokumen (.docx/.pdf) akan terlampir otomatis ke email ini dengan tombol Balas (Reply) langsung tertuju ke surel penulis.</p>
          </div>
          <div style="background-color: #0a1a33; padding: 18px 28px; border-top: 1px solid #1e293b; color: #94a3b8; font-size: 11px; text-align: center;">
            Dewan Redaksi &mdash; Organisasi Riset dan Publikasi Ilmiah Praniti<br>
            Sekretariat: Mojokerto, Jawa Timur, Indonesia
          </div>
        </div>
      `,
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const resData: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: resData?.message || 'Penyedia Resend menolak pengiriman surel.',
        details: resData,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Surel uji coba berhasil dikirim ke ${targetEmail}! Silakan cek kotak masuk (atau folder spam) Gmail Anda.`,
      emailId: resData?.id,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat menguji pengiriman surel.',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
