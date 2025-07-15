// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkRehype from '@remark-rehype/rehype';
import tailwindcss from '@tailwindcss/vite';
import { visit } from 'unist-util-visit'; // Import visit utility

export default defineConfig({
	// **TU NOMBRE DE USUARIO ES 'luissre61'**
	site: 'https://luissre61.github.io', // Confirmado tu nombre de usuario

	// **TU REPOSITORIO ES 'luisreyesdigital'**
	base: '/luisreyesdigital', // Confirmo que esto es correcto para tu repositorio

	trailingSlash: 'always',
	integrations: [mdx(), sitemap()],
	markdown: {
		remarkPlugins: [],
		rehypePlugins: [
			// Add a rehype plugin to adjust image paths
			() => (tree) => {
				visit(tree, 'element', (node) => {
					if (node.tagName === 'img' && node.properties && node.properties.src) {
						node.properties.src = getAssetPath(node.properties.src);
					}
				});
			},
		],
		extendDefaultPlugins: true, // Keep other default plugins
	},
	vite: {
		plugins: [tailwindcss()],
	},
	// **¡ESTO ES LO CLAVE PARA EL ERROR DE LAS FUENTES/ASSETS!**
	build: {
		assetsPrefix: '/luisreyesdigital', // Asegura que esto coincida con tu 'base'
	},
});