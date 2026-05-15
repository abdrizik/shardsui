import adapter from '@sveltejs/adapter-auto'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      preprocess: [vitePreprocess()],
      compilerOptions: {
        runes: true,
        experimental: { async: true }
      },
      adapter: adapter(),
      alias: {
        $content: 'src/content'
      }
    })
  ]
})
