export const prerender = false;

import type { APIRoute } from 'astro';
import { createDbSubmission, getDbSettings, getDbSubmissionByRegNumber } from '../../lib/db';
import { sendSubmissionEmails } from '../../lib/email';

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  return btoa(binary);
}

export const GET: APIRoute = async ({ request, locals }) => {
  const d1 = (locals as any)?.runtime?.env?.DB;
  const url = new URL(request.url);
  const regNumber = url.searchParams.get('regNumber');

  if (!regNumber) {
    return new Response(JSON.stringify({ success: false, error: 'Nomor registrasi naskah wajib disertakan.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const submission = await getDbSubmissionByRegNumber(regNumber, d1);
  if (!submission) {
    return new Response(JSON.stringify({ success: false, error: 'Naskah dengan nomor registrasi tersebut tidak ditemukan.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Return public tracking info (sanitized, no internal notes)
  return new Response(JSON.stringify({
    success: true,
    submission: {
      regNumber: submission.regNumber,
      title: submission.title,
      authorName: `${submission.firstName} ${submission.lastName}`.trim(),
      affiliation: submission.affiliation,
      scopeCluster: submission.scopeCluster,
      status: submission.status,
      createdAt: submission.createdAt,
    },
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const d1 = (locals as any)?.runtime?.env?.DB;
    const envApiKey = (locals as any)?.runtime?.env?.RESEND_API_KEY;

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ success: false, error: 'Format data pengiriman naskah tidak valid.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();

    // Anti-spam honeypot
    const honeypot = formData.get('hp_company_field');
    if (honeypot && String(honeypot).trim() !== '') {
      return new Response(JSON.stringify({ success: false, error: 'Permintaan ditolak: indikasi spam.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const confirmEmail = String(formData.get('confirmEmail') || '').trim().toLowerCase();
    const phone = String(formData.get('phone') || '').trim();
    const affiliation = String(formData.get('affiliation') || '').trim();
    const city = String(formData.get('city') || '').trim();
    const country = String(formData.get('country') || 'Indonesia').trim();
    const scopeCluster = String(formData.get('scopeCluster') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const abstract = String(formData.get('abstract') || '').trim();

    if (!firstName || !email || !phone || !affiliation || !scopeCluster || !title || !abstract) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Seluruh bidang bertanda bintang (*) wajib dilengkapi.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (email !== confirmEmail) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Alamat surel dan konfirmasi surel tidak sesuai. Mohon periksa kembali penulisan alamat email.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Manuscript file validation
    const file = formData.get('manuscriptFile') as File | null;
    if (!file || !(file instanceof File) || file.size === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Berkas manuskrip artikel ilmiah (.docx/.pdf) wajib diunggah.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const MAX_SIZE = 15 * 1024 * 1024; // 15 MB
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Ukuran berkas melebihi batas toleransi maksimal 15 MB. Mohon kompres gambar atau berkas Anda.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fileName = file.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const allowedExtensions = ['.docx', '.doc', '.pdf'];
    if (!allowedExtensions.includes(fileExtension)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Format berkas tidak didukung. Mohon gunakan berkas dengan ekstensi .docx, .doc, atau .pdf.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Supplementary file (optional)
    const suppFile = formData.get('supplementaryFile') as File | null;
    let suppFileName = '';
    if (suppFile && suppFile instanceof File && suppFile.size > 0) {
      suppFileName = suppFile.name;
    }

    // Convert file to Base64 for outbound email attachment
    const arrayBuffer = await file.arrayBuffer();
    const fileBase64 = bufferToBase64(arrayBuffer);

    // Save submission to database (generates unique registration number)
    const submissionRecord = await createDbSubmission({
      firstName,
      lastName,
      email,
      phone,
      affiliation,
      city,
      country,
      scopeCluster,
      title,
      abstract,
      fileName,
      fileSize: file.size,
      supplementaryFileName: suppFileName,
      status: 'submitted',
    }, d1);

    const settings = await getDbSettings(d1);
    const destinationEmail = settings.submission?.email || 'redaksi@praniti.or.id';
    const apiKey = envApiKey || (settings.submission as any)?.resendApiKey || '';

    let emailSent = false;
    let emailError: string | null = null;
    if (apiKey) {
      const emailResult = await sendSubmissionEmails({
        apiKey,
        regNumber: submissionRecord.regNumber,
        destinationEmail,
        authorName: `${firstName} ${lastName}`.trim(),
        authorEmail: email,
        authorPhone: phone,
        affiliation: `${affiliation}${city ? `, ${city}` : ''}${country ? `, ${country}` : ''}`,
        scopeCluster,
        title,
        abstract,
        fileName,
        fileBase64,
        journalName: settings.name,
        journalShortName: settings.shortName,
      });
      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error || 'Resend gagal mengirimkan surel.';
        console.warn('Submission email delivery warning:', emailResult.error);
      }
    } else {
      emailError = 'Resend API Key belum diatur di menu Pengaturan Narahubung Redaksi.';
    }

    return new Response(JSON.stringify({
      success: true,
      regNumber: submissionRecord.regNumber,
      title: submissionRecord.title,
      authorName: `${firstName} ${lastName}`.trim(),
      email: submissionRecord.email,
      phone: submissionRecord.phone,
      destinationEmail,
      emailSent,
      emailError,
      createdAt: submissionRecord.createdAt,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Submission API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Terjadi gangguan internal saat memproses pendaftaran naskah.',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
