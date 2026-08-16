<script lang="ts">
  import { page } from '$app/state'
  import Banner from '$lib/components/banner.svelte'
  import Seo from '$lib/components/seo.svelte'
  import { siteName } from '$lib/data/site'
  import '$lib/styles/main.css'

  const { children } = $props()

  const seo = $derived(
    page.data.seo ?? {
      title: page.error ? `${page.status} — ${siteName}` : siteName,
      description:
        'Unstyled, accessible UI components for Svelte 5. Keyboard, focus management, and ARIA.'
    }
  )
</script>

<Seo title={seo.title} description={seo.description} path={page.url.pathname} />

<Banner />

<div>
  {@render children()}
</div>

<style>
  div {
    position: relative;
    z-index: 0;
    display: flex;
    min-height: 100dvh;
    flex-direction: column;
    padding: calc(var(--spacing) * 4);
  }

  @media (width >= 40rem) {
    div {
      padding: calc(var(--spacing) * 8);
    }
  }

  @media (width >= 64rem) {
    div {
      padding: calc(var(--spacing) * 12);
    }
  }
</style>
