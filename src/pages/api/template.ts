export const prerender = false;

import type { APIRoute } from 'astro';
import { getDbSettings } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const d1 = (locals as any)?.runtime?.env?.DB;
    const config = await getDbSettings(d1);
    const templateUrl = config.branding?.templateUrl || '/template-manuskrip.docx';

    if (templateUrl.startsWith('data:')) {
      const parts = templateUrl.split(';base64,');
      if (parts.length === 2) {
        const mime = parts[0].replace('data:', '') || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const binaryStr = atob(parts[1]);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        return new Response(bytes, {
          status: 200,
          headers: {
            'Content-Type': mime,
            'Content-Disposition': `attachment; filename="Template_Naskah_${config.shortName || 'Jurnal'}.docx"`,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // Validasi URL eksternal (mencegah Open Redirect & Malware Tampering)
    if (templateUrl.startsWith('https://')) {
      try {
        const parsed = new URL(templateUrl);
        const host = parsed.hostname.toLowerCase();
        const isTrustedHost =
          host === 'praniti.or.id' ||
          host.endsWith('.praniti.or.id') ||
          host === 'drive.google.com' ||
          host === 'docs.google.com' ||
          host.endsWith('.pages.dev') ||
          host === 'localhost' ||
          host === '127.0.0.1';

        if (isTrustedHost) {
          return Response.redirect(templateUrl, 302);
        }
      } catch (_) {}
    }

    // Default template internal yang aman
    return Response.redirect('/template-manuskrip.docx', 302);
  } catch (error: any) {
    return new Response('Gagal memuat template: ' + error.message, { status: 500 });
  }
};
