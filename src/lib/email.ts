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

  // 1. Editorial notification email HTML (Design System Resmi JTEBA)
  const editorialHtml = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <title>[JTEBA] Penyerahan Naskah Baru &mdash; ${regNumber}</title>
    <style>
      body { margin: 0; padding: 24px 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
      @media only screen and (max-width: 480px) {
        .container { width: 100% !important; }
        .fluid-pad { padding: 20px !important; }
        .stack-column { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        .mobile-left { text-align: left !important; }
      }
    </style>
  </head>
  <body>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
      <tr>
        <td align="center" style="padding: 0 12px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 640px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 40, 78, 0.08); border: 1px solid #e2e8f0;">
            <!-- Header Masthead -->
            <tr>
              <td class="fluid-pad" style="background-color: #0f284e; padding: 26px 32px; border-bottom: 4px solid #c89b3c; text-align: left;">
                <!-- Logo Chip Putih -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color: #ffffff; padding: 8px 16px; border-radius: 6px; display: inline-block;">
                      <img src="https://ejournal.praniti.or.id/images/logo-jteba.png" alt="JTEBA" width="145" style="display: block; border: 0; max-width: 100%; height: auto;" />
                    </td>
                  </tr>
                </table>
                <div style="font-size: 10.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #c89b3c; margin-top: 14px; margin-bottom: 4px;">
                  ORGANISASI RISET DAN PUBLIKASI ILMIAH PRANITI
                </div>
                <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.35; font-family: Georgia, 'Times New Roman', serif;">
                  ${journalName} (${journalShortName})
                </h1>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; font-family: 'Courier New', Courier, monospace;">
                  e-ISSN: 2999-7127 | p-ISSN: 2999-7119 | Peer-Reviewed &amp; Open Access
                </div>
              </td>
            </tr>

            <!-- Status Banner Proporsional -->
            <tr>
              <td class="fluid-pad" style="background-color: #eff6ff; border-bottom: 1px solid #bfdbfe; padding: 12px 32px; text-align: left;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td class="stack-column" style="vertical-align: middle; padding-right: 12px;">
                      <span style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #075985; display: inline-block; vertical-align: middle;">
                        PEMBERITAHUAN PENGAJUAN NASKAH BARU
                      </span>
                      <span style="font-size: 11px; font-weight: 600; color: #0284c7; display: block; margin-top: 2px; letter-spacing: 0.2px;">
                        New Manuscript Submission Notice
                      </span>
                    </td>
                    <td class="stack-column mobile-left" align="right" style="vertical-align: middle; white-space: nowrap; padding-top: 4px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-table; vertical-align: middle;">
                        <tr>
                          <td style="background-color: #ffffff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 10px; text-align: center; box-shadow: 0 1px 2px rgba(15, 40, 78, 0.05); white-space: nowrap;">
                            <span style="font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin-right: 4px;">ID:</span>
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 700; color: #0f284e; letter-spacing: 0.3px;">${regNumber}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="fluid-pad" style="padding: 28px 32px; font-size: 14px; line-height: 1.6; color: #334155;">
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0; padding: 12px 16px; margin-bottom: 22px; font-size: 13px; color: #1e40af;">
                  <strong>Petunjuk Balasan Redaksi:</strong> Anda dapat langsung menekan tombol <strong>&ldquo;Reply&rdquo; (Balas)</strong> di Gmail untuk merespons calon penulis. Alamat balasan otomatis diarahkan ke <code>${authorEmail}</code>.
                </div>

                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">
                  Data Penulis Korespondensi:
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 22px; font-size: 13px;">
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; width: 32%; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">Nama Lengkap</td>
                    <td style="padding: 10px 14px; font-weight: 700; color: #0f284e; border-bottom: 1px solid #e2e8f0;">${authorName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">Alamat Surel</td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${authorEmail}" style="color: #0369a1; text-decoration: underline;">${authorEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">WhatsApp / Telepon</td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><a href="https://wa.me/${authorPhone.replace(/[^0-9]/g, '')}" style="color: #047857; text-decoration: none; font-weight: 600;">${authorPhone}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Afiliasi / Institusi</td>
                    <td style="padding: 10px 14px; color: #1e293b;">${affiliation}</td>
                  </tr>
                </table>

                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">
                  Informasi &amp; Metadata Naskah:
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 22px; font-size: 13px;">
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; width: 32%; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">Rumpun Fokus</td>
                    <td style="padding: 10px 14px; font-weight: 700; color: #0f284e; border-bottom: 1px solid #e2e8f0;">${scopeCluster}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">Judul Manuskrip</td>
                    <td style="padding: 10px 14px; font-weight: 700; color: #0f284e; line-height: 1.4; border-bottom: 1px solid #e2e8f0;">${title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Nama Berkas</td>
                    <td style="padding: 10px 14px; font-family: 'Courier New', Courier, monospace; color: #334155;">${fileName}</td>
                  </tr>
                </table>

                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">
                  Abstrak / Surat Pengantar:
                </div>
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0f284e; padding: 14px 16px; border-radius: 0 6px 6px 0; font-size: 13px; color: #334155; line-height: 1.6; font-style: italic;">
                  ${abstract.replace(/\n/g, '<br>')}
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="fluid-pad" style="background-color: #0a1a33; padding: 24px 32px; border-top: 1px solid #1e293b; color: #94a3b8; font-size: 11px; line-height: 1.6; text-align: center;">
                <div style="font-weight: 700; color: #e2e8f0; margin-bottom: 4px;">
                  Dewan Redaksi JTEBA &mdash; Organisasi Riset dan Publikasi Ilmiah Praniti
                </div>
                <div style="color: #cbd5e1;">
                  Sekretariat: Mojokerto, Jawa Timur, Indonesia
                </div>
                <div style="margin-top: 8px;">
                  Surel: <a href="mailto:redaksi@praniti.or.id" style="color: #c89b3c; text-decoration: none; font-weight: 600;">redaksi@praniti.or.id</a> &nbsp;|&nbsp; 
                  Portal: <a href="https://ejournal.praniti.or.id/index/JTEBA" target="_blank" style="color: #c89b3c; text-decoration: none; font-weight: 600;">ejournal.praniti.or.id</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  // 2. Author receipt confirmation email HTML (Design System Resmi JTEBA)
  const authorHtml = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <title>[JTEBA] Tanda terima pengajuan naskah &mdash; ${regNumber}</title>
    <style>
      body { margin: 0; padding: 24px 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
      @media only screen and (max-width: 480px) {
        .container { width: 100% !important; }
        .fluid-pad { padding: 20px !important; }
        .stack-column { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        .mobile-left { text-align: left !important; }
      }
    </style>
  </head>
  <body>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
      <tr>
        <td align="center" style="padding: 0 12px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 640px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 40, 78, 0.08); border: 1px solid #e2e8f0;">
            <!-- Header Masthead -->
            <tr>
              <td class="fluid-pad" style="background-color: #0f284e; padding: 26px 32px; border-bottom: 4px solid #c89b3c; text-align: left;">
                <!-- Logo Chip Putih -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color: #ffffff; padding: 8px 16px; border-radius: 6px; display: inline-block;">
                      <img src="https://ejournal.praniti.or.id/images/logo-jteba.png" alt="JTEBA" width="145" style="display: block; border: 0; max-width: 100%; height: auto;" />
                    </td>
                  </tr>
                </table>
                <div style="font-size: 10.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #c89b3c; margin-top: 14px; margin-bottom: 4px;">
                  ORGANISASI RISET DAN PUBLIKASI ILMIAH PRANITI
                </div>
                <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.35; font-family: Georgia, 'Times New Roman', serif;">
                  ${journalName} (${journalShortName})
                </h1>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; font-family: 'Courier New', Courier, monospace;">
                  e-ISSN: 2999-7127 | p-ISSN: 2999-7119 | Peer-Reviewed &amp; Open Access
                </div>
              </td>
            </tr>

            <!-- Status Banner Proporsional -->
            <tr>
              <td class="fluid-pad" style="background-color: #eff6ff; border-bottom: 1px solid #bfdbfe; padding: 12px 32px; text-align: left;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td class="stack-column" style="vertical-align: middle; padding-right: 12px;">
                      <span style="font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #075985; display: inline-block; vertical-align: middle;">
                        TANDA TERIMA PENGAJUAN NASKAH
                      </span>
                      <span style="font-size: 11px; font-weight: 600; color: #0284c7; display: block; margin-top: 2px; letter-spacing: 0.2px;">
                        Submission Acknowledgement
                      </span>
                    </td>
                    <td class="stack-column mobile-left" align="right" style="vertical-align: middle; white-space: nowrap; padding-top: 4px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-table; vertical-align: middle;">
                        <tr>
                          <td style="background-color: #ffffff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 10px; text-align: center; box-shadow: 0 1px 2px rgba(15, 40, 78, 0.05); white-space: nowrap;">
                            <span style="font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; margin-right: 4px;">ID:</span>
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 700; color: #0f284e; letter-spacing: 0.3px;">${regNumber}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="fluid-pad" style="padding: 28px 32px; font-size: 14px; line-height: 1.6; color: #334155;">
                <p style="margin: 0 0 16px 0; color: #1e293b;">
                  Kepada Yth.<br>
                  <strong style="color: #0f284e; font-size: 15px;">${authorName}</strong><br>
                  <span style="color: #64748b; font-size: 13px;">${affiliation}</span>
                </p>

                <p style="margin: 0 0 18px 0;">
                  Dengan hormat,<br>
                  Terima kasih telah mengajukan manuskrip artikel ilmiah Anda ke <strong>${journalName} (${journalShortName})</strong>. Berkas manuskrip Anda telah <strong>berhasil diterima</strong> oleh sistem redaksi kami dan telah masuk ke dalam antrean penelaahan awal (<em>initial desk review</em>).
                </p>

                <!-- Detail Table -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 24px; font-size: 13px;">
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; width: 32%; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">ID Registrasi</td>
                    <td style="padding: 10px 14px; font-family: 'Courier New', Courier, monospace; font-weight: 700; color: #0f284e; border-bottom: 1px solid #e2e8f0;">${regNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">Judul Manuskrip</td>
                    <td style="padding: 10px 14px; font-weight: 700; color: #0f284e; line-height: 1.4; border-bottom: 1px solid #e2e8f0;">${title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">Rumpun Fokus</td>
                    <td style="padding: 10px 14px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${scopeCluster}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">Nama Berkas</td>
                    <td style="padding: 10px 14px; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #334155; border-bottom: 1px solid #e2e8f0;">${fileName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Status Tahapan</td>
                    <td style="padding: 10px 14px;">
                      <span style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 3px;">
                        DALAM PROSES PENELAAHAN AWAL (INITIAL DESK REVIEW)
                      </span>
                    </td>
                  </tr>
                </table>

                <!-- Callout 1: Workflow -->
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0f284e; padding: 14px 18px; border-radius: 0 6px 6px 0; margin-bottom: 22px;">
                  <strong style="color: #0f284e; font-size: 13px; display: block; margin-bottom: 8px;">
                    Tahapan Selanjutnya (Editorial &amp; Review Workflow):
                  </strong>
                  <ol style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #475569;">
                    <li style="margin-bottom: 6px;"><strong>Penelaahan Awal (Desk Review / 1&ndash;3 hari kerja):</strong> Managing Editor memeriksa kesesuaian ruang lingkup, format templat, kelengkapan identitas penulis, dan ambang kemiripan Turnitin (maksimal 20%).</li>
                    <li style="margin-bottom: 6px;"><strong>Penelaahan Mitra Bestari (Single-Blind Review / 14 hari kalender):</strong> Naskah yang lolos tahap awal ditelaah oleh minimal 2 reviewer independen (reviewer mengetahui identitas penulis, identitas reviewer dirahasiakan). Keputusan pertama diupayakan paling lambat 30 hari kalender.</li>
                    <li style="margin-bottom: 0;"><strong>Keputusan Redaksi:</strong> Hasil evaluasi (diterima, revisi, atau ditolak) akan dikirimkan langsung melalui surel ini.</li>
                  </ol>
                </div>

                <!-- Callout 2: Transparansi Biaya -->
                <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-left: 4px solid #059669; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-bottom: 24px; font-size: 12px; color: #065f46; line-height: 1.6;">
                  <strong style="display: block; margin-bottom: 4px;">Kebijakan Transparansi Biaya:</strong>
                  JTEBA tidak memungut biaya pengajuan (Rp0) maupun biaya penelaahan (Rp0). Biaya pemrosesan artikel (APC Rp100.000) hanya dikenakan apabila naskah Anda dinyatakan resmi Diterima (<em>Accepted</em>).
                </div>

                <!-- CTA -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 10px 0;">
                  <tr>
                    <td align="center">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="background-color: #0f284e; border-radius: 6px;">
                            <a href="https://ejournal.praniti.or.id/index/JTEBA" target="_blank" style="display: inline-block; background-color: #0f284e; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 6px; border: 1px solid #0f284e;">
                              Buka Portal JTEBA &nearr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0 0 24px 0; font-size: 13px; color: #475569;">
                  Apabila Anda memiliki pertanyaan, silakan membalas surel ini dengan menyertakan Nomor Registrasi naskah (<code>${regNumber}</code>).
                </p>

                <!-- Tanda Tangan -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                  <tr>
                    <td>
                      <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Hormat kami,</div>
                      <div style="font-size: 15px; font-weight: 800; color: #0f284e; font-family: Georgia, serif;">
                        Dewan Redaksi ${journalShortName}
                      </div>
                      <div style="font-size: 12px; font-weight: 600; color: #c89b3c; margin-top: 1px;">
                        Editorial Board
                      </div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                        Organisasi Riset dan Publikasi Ilmiah Praniti
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="fluid-pad" style="background-color: #0a1a33; padding: 24px 32px; border-top: 1px solid #1e293b; color: #94a3b8; font-size: 11px; line-height: 1.6; text-align: center;">
                <div style="font-weight: 700; color: #e2e8f0; margin-bottom: 4px;">
                  Dewan Redaksi ${journalShortName} &mdash; Organisasi Riset dan Publikasi Ilmiah Praniti
                </div>
                <div style="color: #cbd5e1;">
                  Sekretariat: Mojokerto, Jawa Timur, Indonesia
                </div>
                <div style="margin-top: 8px;">
                  Surel: <a href="mailto:${destinationEmail}" style="color: #c89b3c; text-decoration: none; font-weight: 600;">${destinationEmail}</a> &nbsp;|&nbsp; 
                  Portal: <a href="https://ejournal.praniti.or.id/index/JTEBA" target="_blank" style="color: #c89b3c; text-decoration: none; font-weight: 600;">ejournal.praniti.or.id</a>
                </div>
                <div style="margin-top: 14px; color: #64748b; font-size: 10px;">
                  Email resmi ini dikirim otomatis dan tercatat dalam sistem penerbitan JTEBA.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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
