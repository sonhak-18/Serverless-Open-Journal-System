import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  image: {
    service: passthroughImageService(),
  },
  integrations: [tailwind({
    applyBaseStyles: false,
  })],
  site: 'https://jtaap.darpana.web.id',
});
