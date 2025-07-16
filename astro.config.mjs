// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // **TU NOMBRE DE USUARIO ES 'luissre61'**
  site: 'https://luissre61.github.io', // Confirmado tu nombre de usuario

  // **TU REPOSITORIO ES 'luisreyesdigital'**
  base: '/luisreyesdigital', // Confirmo que esto es correcto para tu repositorio

  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
