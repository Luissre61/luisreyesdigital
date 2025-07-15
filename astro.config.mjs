// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Importar el plugin de vite para tailwind
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // URL base correcta con tu nombre de usuario de GitHub
  site: 'https://luissre61.github.io',
  // El nombre de tu repositorio
  base: '/luisreyesdigital',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});