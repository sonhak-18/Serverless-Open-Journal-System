// Document Repository Cloudflare Worker
// Streamlined Engine: Multi-Drive Service Account Token Rotation & Native PDF Streaming
// Architecture: Native Browser PDF Viewer (inline stream) & Admin Management API

import serviceaccountsList from './serviceaccounts.json';
const serviceaccounts = serviceaccountsList || [];

const randomserviceaccount = serviceaccounts.length > 0 
  ? serviceaccounts[Math.floor(Math.random() * serviceaccounts.length)] 
  : null;

const PORTAL_URL = typeof MAIN_PORTAL_URL !== 'undefined' ? MAIN_PORTAL_URL : 'https://jurnal.example.com';

const authConfig = {
  siteName: "Document Repository",
  service_account: true,
  service_account_json: randomserviceaccount,
  admin_token: typeof ADMIN_SECRET_TOKEN !== 'undefined' ? ADMIN_SECRET_TOKEN : "your-secret-admin-token",
  enable_cors_file_down: true,
  cors_domain: "*",
  roots: [
    {
      id: typeof GDRIVE_ROOT_FOLDER_ID !== 'undefined' ? GDRIVE_ROOT_FOLDER_ID : "YOUR_GOOGLE_DRIVE_FOLDER_ID",
      name: "Naskah Publikasi (Volume 1)",
      type: "folder"
    }
  ]
};

// Drive prefix mappings (supports 'one', 'two', 'three', '1', '2', '3', '0:', '1:', etc.)
const DRIVE_PREFIX_MAP = {
  'one': 0,
  'two': 1,
  'three': 2,
  'four': 3,
  'five': 4,
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3,
  '5': 4,
  '0:': 0,
  '1:': 1,
  '2:': 2,
  'papers': 0,
  'repo': 0,
  'naskah': 0
};

// Fixed Terms
const DriveFixedTerms = {
  default_file_fields: 'parents,id,name,mimeType,modifiedTime,createdTime,fileExtension,size',
  gd_root_type: { user_drive: 0, share_drive: 1 },
  folder_mime_type: 'application/vnd.google-apps.folder'
};

// Web Crypto Token Generation for GCP Service Accounts (RS256 JWT)
const JSONWebToken = {
  header: { alg: 'RS256', typ: 'JWT' },
  importKey: async function(pemKey) {
    const pemDER = this.textUtils.base64ToArrayBuffer(
      pemKey.split('\n').map(s => s.trim()).filter(l => l.length && !l.startsWith('---')).join('')
    );
    return crypto.subtle.importKey('pkcs8', pemDER, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  },
  createSignature: async function(text, key) {
    const textBuffer = this.textUtils.stringToArrayBuffer(text);
    return crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, textBuffer);
  },
  generateGCPToken: async function(serviceAccount) {
    const iat = parseInt(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      exp: iat + 3600,
      iat: iat
    };
    const toBase64Url = s => s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const encPayload = toBase64Url(btoa(JSON.stringify(payload)));
    const encHeader = toBase64Url(btoa(JSON.stringify(this.header)));
    const key = await this.importKey(serviceAccount.private_key);
    const signed = await this.createSignature(encHeader + "." + encPayload, key);
    return encHeader + "." + encPayload + "." + toBase64Url(this.textUtils.arrayBufferToBase64(signed));
  },
  textUtils: {
    base64ToArrayBuffer: function(base64) {
      const binary_string = atob(base64);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
      return bytes.buffer;
    },
    stringToArrayBuffer: function(str) {
      const len = str.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = str.charCodeAt(i);
      return bytes.buffer;
    },
    arrayBufferToBase64: function(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    }
  }
};

function enQuery(data) {
  const ret = [];
  for (const d in data) ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Google Drive Core Handler
class GoogleDriveRepo {
  constructor(rootConfig, order) {
    this.order = order;
    this.root = rootConfig;
    this.authConfig = authConfig;
    this.paths = { "/": rootConfig.id };
    this.files = {};
    this._access_token = null;
    this._token_expiry = 0;
  }

  async getAccessToken() {
    if (this._access_token && this._token_expiry > Date.now()) {
      return this._access_token;
    }
    const sa = (serviceaccounts && serviceaccounts.length)
      ? serviceaccounts[Math.floor(Math.random() * serviceaccounts.length)]
      : this.authConfig.service_account_json;
    const jwttoken = await JSONWebToken.generateGCPToken(sa);
    const post_data = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwttoken
    };
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: enQuery(post_data)
    });
    const obj = await response.json();
    if (obj.access_token) {
      this._access_token = obj.access_token;
      this._token_expiry = Date.now() + 3500 * 1000;
      return this._access_token;
    }
    throw new Error('Failed to obtain Google Cloud token: ' + JSON.stringify(obj));
  }

  async requestOptions(headers = {}, method = 'GET') {
    const token = await this.getAccessToken();
    return {
      method,
      headers: Object.assign({
        'Authorization': 'Bearer ' + token,
        'Accept-Encoding': 'gzip, deflate, br'
      }, headers)
    };
  }

  async findItemById(id) {
    const url = `https://www.googleapis.com/drive/v3/files/${id}?fields=${DriveFixedTerms.default_file_fields}&supportsAllDrives=true`;
    const opt = await this.requestOptions();
    const res = await fetch(url, opt);
    return res.ok ? await res.json() : null;
  }

  async get_single_file(filename) {
    if (this.files[filename]) return this.files[filename];
    const parent = this.root.id;
    const cleanName = decodeURIComponent(filename).replace(/'/g, "\\'");
    const params = {
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      q: `'${parent}' in parents and name = '${cleanName}' and trashed = false`,
      fields: "files(id, name, mimeType, size, createdTime, modifiedTime, fileExtension)"
    };
    const url = 'https://www.googleapis.com/drive/v3/files?' + enQuery(params);
    const opt = await this.requestOptions();
    let res;
    for (let i = 0; i < 3; i++) {
      res = await fetch(url, opt);
      if (res.ok) break;
      await sleep(500 * (i + 1));
    }
    if (!res || !res.ok) return null;
    const data = await res.json();
    const file = data.files && data.files[0];
    if (file) this.files[filename] = file;
    return file;
  }

  async _list_gdrive_files(parent = this.root.id) {
    const params = {
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 100,
      orderBy: 'name, modifiedTime desc',
      q: `'${parent}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder' and name != '.password'`,
      fields: "files(id, name, mimeType, size, modifiedTime, fileExtension)"
    };
    const url = 'https://www.googleapis.com/drive/v3/files?' + enQuery(params);
    const opt = await this.requestOptions();
    const res = await fetch(url, opt);
    if (!res.ok) return { files: [] };
    const data = await res.json();
    return { files: data.files || [] };
  }
}

// Initialize drives
const gds = authConfig.roots.map((r, i) => new GoogleDriveRepo(r, i));

// Stream download / inline PDF
async function streamFile(gd, file, range = '', inline = true) {
  const opt = await gd.requestOptions();
  const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
  if (range) opt.headers['Range'] = range;
  let res;
  for (let i = 0; i < 3; i++) {
    res = await fetch(url, opt);
    if (res.ok) break;
    await sleep(500 * (i + 1));
  }
  if (!res || !res.ok) {
    return new Response(JSON.stringify({ error: "Failed to stream file from Google Drive" }), {
      status: res ? res.status : 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  const responseHeaders = new Headers(res.headers);
  responseHeaders.set("Content-Type", file.mimeType || "application/pdf");
  responseHeaders.set("Accept-Ranges", "bytes");
  responseHeaders.set("Access-Control-Allow-Origin", "*");

  if (file.size) {
    responseHeaders.set("Content-Length", file.size);
  }

  if (inline) {
    responseHeaders.set("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`);
  } else {
    responseHeaders.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`);
  }

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders
  });
}

// Main Request Handler
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 1. Root / Directory / Index access: redirect to main journal portal
  if (path === '/' || path === '' || path === '/0:' || path === '/0:/' || path === '/one' || path === '/one/') {
    return Response.redirect(PORTAL_URL, 302);
  }

  // 2. Secret Admin API for file listing & management (used by JTAAP Admin Panel)
  if (path === '/api/admin/files') {
    const token = url.searchParams.get('token') || request.headers.get('Authorization')?.replace(/^Bearer\s+/, '');
    if (!token || token !== authConfig.admin_token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or missing admin token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const driveIndex = Number(url.searchParams.get('drive')) || 0;
    const gd = gds[driveIndex] || gds[0];
    const list = await gd._list_gdrive_files();
    const driveName = gd.root.name;
    const prefix = driveIndex === 0 ? 'one' : (driveIndex === 1 ? 'two' : 'three');

    const formattedFiles = list.files.map(f => ({
      id: f.id,
      name: f.name,
      size: Number(f.size) || 0,
      modifiedTime: f.modifiedTime,
      mimeType: f.mimeType,
      url: `${url.origin}/${prefix}/${encodeURIComponent(f.name)}`,
      downloadUrl: `${url.origin}/${prefix}/${encodeURIComponent(f.name)}?download=true`
    }));

    return new Response(JSON.stringify({
      success: true,
      driveIndex,
      driveName,
      prefix,
      count: formattedFiles.length,
      files: formattedFiles
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 3. Handle file paths: /one/[filename], /two/[filename], /1/[filename], /0:/[filename]
  const routeMatch = path.match(/^\/([a-zA-Z0-9_:-]+)\/(.+)$/);
  if (!routeMatch) {
    return Response.redirect(PORTAL_URL, 302);
  }

  const rawPrefix = routeMatch[1].toLowerCase();
  const rawFileName = routeMatch[2];

  const driveIndex = DRIVE_PREFIX_MAP[rawPrefix];
  if (driveIndex === undefined || driveIndex >= gds.length) {
    return Response.redirect(PORTAL_URL, 302);
  }

  const gd = gds[driveIndex];

  // If path ends with slash (directory browsing attempt)
  if (rawFileName.endsWith('/')) {
    return Response.redirect(PORTAL_URL, 302);
  }

  // Strip legacy ?a=view and redirect to clean PDF URL
  if (url.searchParams.has('a')) {
    url.searchParams.delete('a');
    return Response.redirect(url.toString(), 302);
  }

  // Fetch file from Google Drive (any file uploaded to the journal folder is served directly)
  const file = await gd.get_single_file(rawFileName);
  if (!file || !file.id) {
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Naskah Tidak Ditemukan</title><style>body{font-family:sans-serif;text-align:center;padding:50px;background:#f8fafc;color:#1e293b}a{color:#0284c7;text-decoration:none}</style></head><body><h2>Naskah Tidak Ditemukan di Repositori</h2><p>Berkas yang Anda minta tidak tersedia atau telah dipindahkan.</p><p><a href="${PORTAL_URL}">&larr; Kembali ke Beranda Portal Jurnal</a></p></body></html>`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const range = request.headers.get('Range');
  const forceDownload = url.searchParams.get('download') === 'true';
  const inline = !forceDownload;

  return streamFile(gd, file, range, inline);
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request).catch(
    err => {
      console.error(err.stack);
      return new Response('Internal Server Error', { status: 500 });
    }
  ));
});
