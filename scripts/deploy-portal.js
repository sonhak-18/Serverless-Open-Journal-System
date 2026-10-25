import { execSync } from 'node:child_process';
import { existsSync, copyFileSync, unlinkSync } from 'node:fs';

const hasLocalConfig = existsSync('wrangler.local.toml');
if (hasLocalConfig) {
  copyFileSync('wrangler.toml', 'wrangler.tmp.toml');
  copyFileSync('wrangler.local.toml', 'wrangler.toml');
}

try {
  execSync('node ./node_modules/astro/astro.js build && node ./node_modules/wrangler/bin/wrangler.js pages deploy dist --project-name jteba-open-journal-system --commit-dirty=true', { stdio: 'inherit' });
} finally {
  if (hasLocalConfig && existsSync('wrangler.tmp.toml')) {
    copyFileSync('wrangler.tmp.toml', 'wrangler.toml');
    unlinkSync('wrangler.tmp.toml');
  }
}
