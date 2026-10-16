import { execSync } from 'node:child_process';
import { existsSync, copyFileSync, unlinkSync } from 'node:fs';

const hasLocalConfig = existsSync('wrangler.local.toml');
if (hasLocalConfig) {
  copyFileSync('wrangler.toml', 'wrangler.tmp.toml');
  copyFileSync('wrangler.local.toml', 'wrangler.toml');
}

try {
  execSync('astro build && wrangler pages deploy dist --project-name sektansia-press', { stdio: 'inherit' });
} finally {
  if (hasLocalConfig && existsSync('wrangler.tmp.toml')) {
    copyFileSync('wrangler.tmp.toml', 'wrangler.toml');
    unlinkSync('wrangler.tmp.toml');
  }
}
