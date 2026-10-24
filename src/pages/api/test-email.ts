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
      from: 'JTEBA Submission Test <noreply@praniti.or.id>',
      to: [targetEmail],
      reply_to: targetEmail,
      subject: `[JTEBA Test] Uji Coba Pengiriman Resend API (${new Date().toLocaleTimeString('id-ID')})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
          <div style="background: #0f284e; color: #ffffff; padding: 18px 24px;">
            <h2 style="margin: 0; font-size: 17px; font-weight: 700;">Pengujian Resend API Berhasil</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">Portal JTEBA (Jurnal Terbuka Ekonomi, Bisnis, dan Akuntabilitas)</p>
          </div>
          <div style="padding: 24px; font-size: 14px;">
            <p>Halo Dewan Redaksi,</p>
            <p>Surel uji coba ini mengonfirmasi bahwa <strong>Resend API Key</strong> dan alamat surel penerima redaksi (<code>${targetEmail}</code>) telah terhubung dengan benar ke sistem portal penerimaan naskah.</p>
            <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-size: 13px; margin: 16px 0;">
              <div><strong>Alamat Tujuan:</strong> ${targetEmail}</div>
              <div><strong>Waktu Pengujian:</strong> ${new Date().toISOString()}</div>
              <div><strong>Status Integrasi:</strong> <span style="color: #047857; font-weight: bold;">Aktif & Siap Menerima Naskah</span></div>
            </div>
            <p style="font-size: 12px; color: #64748b;">Setiap kali calon penulis mengirimkan naskah lewat formulir online, berkas manuskrip dan nomor registrasi akan dikirimkan ke alamat ini dengan tombol Reply yang otomatis mengarah ke surel penulis.</p>
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
