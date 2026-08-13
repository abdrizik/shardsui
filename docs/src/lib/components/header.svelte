<script lang="ts">
  import { resolve } from '$app/paths'
  import Logo from '$lib/components/logo.svelte'
  import MobileNav from '$lib/components/mobile-nav.svelte'
  import SiteLinks from '$lib/components/site-links.svelte'
</script>

<header>
  <a href={resolve('/')} aria-label="ShardsUI">
    <Logo />
  </a>
  <nav aria-label="Site links">
    <SiteLinks />
    <MobileNav />
  </nav>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block-end: clamp(
      calc(var(--spacing) * 16),
      calc(var(--spacing) * 7) + 3vw,
      calc(var(--spacing) * 22)
    );
  }

  header > a {
    display: flex;
    inline-size: fit-content;
    border-radius: var(--radius-md);
    color: var(--color-gray-900);
  }

  nav {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 3);
  }
</style>
