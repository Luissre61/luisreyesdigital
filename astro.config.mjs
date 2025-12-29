// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // **TU NOMBRE DE USUARIO ES 'luissre61'**
  site: 'https://luisreyesdigital.com', // Confirmado tu nombre de usuario

  // **TU REPOSITORIO ES 'luisreyesdigital'**
  base: '/luisreyesdigital', // Confirmo que esto es correcto para tu repositorio

  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
