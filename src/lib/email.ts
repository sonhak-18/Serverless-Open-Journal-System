export interface SubmissionEmailPayload {
  apiKey: string;
  regNumber: string;
  destinationEmail: string;
  authorName: string;
  authorEmail: string;
  authorPhone: string;
  affiliation: string;
  scopeCluster: string;
  title: string;
  abstract: string;
  fileName: string;
  fileBase64?: string;
  journalName: string;
  journalShortName: string;
  fromEmail?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  editorialEmailId?: string;
  authorEmailId?: string;
  error?: string;
}

export async function sendSubmissionEmails(
  payload: SubmissionEmailPayload
): Promise<EmailDispatchResult> {
  const {
    apiKey,
    regNumber,
    destinationEmail,
    authorName,
    authorEmail,
    authorPhone,
    affiliation,
    scopeCluster,
    title,
    abstract,
    fileName,
    fileBase64,
    journalName,
    journalShortName,
    fromEmail,
  } = payload;

  if (!apiKey) {
    return { success: false, error: 'Resend API key tidak ditemukan.' };
  }

  // Sender address: verified domain praniti.or.id
  const senderAddress = fromEmail || 'JTEBA Submission <noreply@praniti.or.id>';

  // Editorial notification email HTML
  const editorialHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
      .container { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; }
      .header { background: #0f284e; color: #ffffff; padding: 20px 24px; }
      .header h1 { margin: 0 0 6px 0; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
      .header p { margin: 0; font-size: 12px; color: #cbd5e1; }
      .badge-bar { background: #f1f5f9; padding: 12px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
      .reg-badge { font-family: monospace; font-size: 14px; font-weight: 700; color: #0f284e; background: #e2e8f0; padding: 4px 10px; border-radius: 4px; border: 1px solid #cbd5e1; display: inline-block; }
      .content { padding: 24px; }
      .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
      .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px; }
      .data-table td { padding: 8px 0; vertical-align: top; }
      .data-table td.label { width: 35%; color: #64748b; font-weight: 600; }
      .data-table td.val { width: 65%; color: #0f172a; }
      .abstract-box { background: #f8fafc; border-left: 3px solid #0f284e; padding: 12px 16px; font-size: 13px; color: #334155; line-height: 1.6; margin-top: 6px; font-style: italic; }
      .alert-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #1e40af; }
      .footer { background: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${journalName} (${journalShortName})</h1>
        <p>Pemberitahuan Penyerahan Naskah Baru (New Manuscript Submission)</p>
      </div>

      <div class="badge-bar">
        <div>
          <span style="font-size: 12px; color: #64748b;">Nomor Registrasi Naskah:</span><br>
          <span class="reg-badge">${regNumber}</span>
        </div>
      </div>

      <div class="content">
        <div class="alert-box">
          <strong>Petunjuk Balasan Redaksi:</strong> Anda dapat langsung menekan tombol <strong>"Reply" (Balas)</strong> di Gmail untuk merespons calon penulis. Alamat pengirim telah secara otomatis diarahkan ke <code>${authorEmail}</code>.
        </div>

        <div class="section-title">Data Penulis Korespondensi</div>
        <table class="data-table">
          <tr>
            <td class="label">Nama Lengkap</td>
            <td class="val"><strong>${authorName}</strong></td>
          </tr>
          <tr>
            <td class="label">Alamat Surel (Email)</td>
            <td class="val"><a href="mailto:${authorEmail}" style="color: #0369a1;">${authorEmail}</a></td>
          </tr>
          <tr>
            <td class="label">WhatsApp / Telepon</td>
            <td class="val"><a href="https://wa.me/${authorPhone.replace(/[^0-9]/g, '')}" style="color: #047857; text-decoration: none; font-weight: 600;">${authorPhone}</a></td>
          </tr>
          <tr>
            <td class="label">Afiliasi / Institusi</td>
            <td class="val">${affiliation}</td>
          </tr>
        </table>

        <div class="section-title">Informasi & Metadata Naskah</div>
        <table class="data-table">
          <tr>
            <td class="label">Rumpun Fokus (Scope)</td>
            <td class="val"><strong>${scopeCluster}</strong></td>
          </tr>
          <tr>
            <td class="label">Judul Manuskrip</td>
            <td class="val"><strong style="font-size: 15px; color: #0f284e;">${title}</strong></td>
          </tr>
          <tr>
            <td class="label">Nama Berkas</td>
            <td class="val"><code>${fileName}</code></td>
          </tr>
        </table>

        <div class="section-title">Abstrak / Surat Pengantar</div>
        <div class="abstract-box">
          ${abstract.replace(/\n/g, '<br>')}
        </div>
      </div>

      <div class="footer">
        Surel ini dikirim secara otomatis oleh Portal Penerimaan Naskah ${journalShortName}.<br>
        Organisasi Riset dan Publikasi Ilmiah Praniti.
      </div>
    </div>
  </body>
  </html>
  `;

  // Author receipt confirmation email HTML
  const authorHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; }
      .header { background: #0f284e; color: #ffffff; padding: 24px; text-align: center; }
      .header h1 { margin: 0 0 6px 0; font-size: 18px; font-weight: 700; }
      .header p { margin: 0; font-size: 12px; color: #cbd5e1; }
      .content { padding: 24px; font-size: 14px; color: #334155; }
      .badge-box { background: #f8fafc; border: 2px dashed #0f284e; border-radius: 6px; text-align: center; padding: 16px; margin: 20px 0; }
      .reg-num { font-family: monospace; font-size: 18px; font-weight: 800; color: #0f284e; letter-spacing: 0.05em; }
      .steps-box { background: #f1f5f9; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 13px; }
      .steps-box ol { margin: 8px 0 0 0; padding-left: 20px; }
      .steps-box li { margin-bottom: 6px; }
      .footer { background: #f8fafc; padding: 16px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${journalName}</h1>
        <p>Konfirmasi Penerimaan Manuskrip (Submission Acknowledgment)</p>
      </div>

      <div class="content">
        <p>Yth. <strong>${authorName}</strong>,</p>
        <p>Terima kasih telah mengajukan naskah artikel ilmiah Anda ke <strong>${journalName} (${journalShortName})</strong>. Berkas naskah Anda telah berhasil dicatat dalam basis data sistem penerimaan kami dengan rincian sebagai berikut:</p>

        <div class="badge-box">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px;">Nomor Registrasi Naskah Resmi:</div>
          <div class="reg-num">${regNumber}</div>
        </div>

        <p><strong>Judul Naskah:</strong><br>${title}</p>
        <p><strong>Rumpun Bidang Fokus:</strong><br>${scopeCluster}</p>

        <div class="steps-box">
          <strong>Tahap Selanjutnya:</strong>
          <ol>
            <li><strong>Pemeriksaan Format Awal (Desk Review)</strong>: Redaksi akan memeriksa kesesuaian template dan ambang batas Turnitin dalam 1–3 hari kerja.</li>
            <li><strong>Penelaahan Sejawat Ganda (Double-Blind Peer Review)</strong>: Naskah yang lolos tahap awal akan diteruskan ke minimal 2 (dua) mitra bestari independen.</li>
            <li><strong>Korespondensi Resmi</strong>: Setiap pembaruan status naskah akan disampaikan langsung melalui alamat surel ini dengan menyertakan nomor registrasi di atas.</li>
          </ol>
        </div>

        <p>Mohon simpan nomor registrasi ini untuk seluruh komunikasi korespondensi berikutnya dengan dewan redaksi.</p>

        <p style="margin-top: 24px;">Hormat kami,<br><strong>Dewan Redaksi ${journalShortName}</strong><br><span style="font-size: 12px; color: #64748b;">${destinationEmail}</span></p>
      </div>

      <div class="footer">
        Surel ini dikirimkan secara otomatis sebagai tanda terima resmi penyerahan naskah.<br>
        Organisasi Riset dan Publikasi Ilmiah Praniti.
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    // 1. Send Editorial Notification
    const editorialPayload: any = {
      from: senderAddress,
      to: [destinationEmail],
      reply_to: authorEmail,
      subject: `[${regNumber}] Penyerahan Naskah: ${title.slice(0, 60)}${title.length > 60 ? '...' : ''} - ${authorName}`,
      html: editorialHtml,
    };

    if (fileBase64 && fileName) {
      editorialPayload.attachments = [
        {
          filename: fileName,
          content: fileBase64,
        },
      ];
    }

    const editorialRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editorialPayload),
    });

    const editorialData: any = await editorialRes.json().catch(() => ({}));
    if (!editorialRes.ok) {
      console.warn('Resend Editorial Email warning:', editorialData);
      return {
        success: false,
        error: editorialData?.message || 'Gagal mengirimkan surel ke redaksi via Resend API.',
      };
    }

    // 2. Send Author Confirmation (Receipt)
    let authorEmailId: string | undefined;
    try {
      const authorRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderAddress,
          to: [authorEmail],
          reply_to: destinationEmail,
          subject: `[${regNumber}] Konfirmasi Penerimaan Naskah - ${journalShortName}`,
          html: authorHtml,
        }),
      });
      const authorData: any = await authorRes.json().catch(() => ({}));
      authorEmailId = authorData?.id;
    } catch (_) {}

    return {
      success: true,
      editorialEmailId: editorialData?.id,
      authorEmailId,
    };
  } catch (err: any) {
    console.error('Email dispatch error:', err);
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan jaringan saat menghubungi penyedia API surel.',
    };
  }
}
