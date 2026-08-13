<script lang="ts">
  import Header from '$lib/components/header.svelte'
  import SideNav from '$lib/components/side-nav.svelte'

  const { children } = $props()
</script>

<a href="#main" class="skip-link">Skip to content</a>

<div class="page">
  <Header />
  <div>
    <SideNav />
    <main id="main">
      {@render children()}
    </main>
  </div>
</div>

<style>
  .skip-link {
    position: absolute;
    inset-inline-start: calc(var(--spacing) * 4);
    inset-block-start: calc(var(--spacing) * 4);
    z-index: 100;
    padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
    border-radius: var(--radius-md);
    background-color: var(--color-content);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    outline: 2px solid var(--color-gray-900);
    outline-offset: calc(var(--spacing) * 0.5);
    clip-path: inset(50%);
  }

  .skip-link:focus-visible {
    clip-path: none;
  }

  div {
    --page: 58rem;
    --side-nav: 11rem;
    --side-nav-gap: calc(var(--spacing) * 14);
    --measure: calc(var(--page) - var(--side-nav) - var(--side-nav-gap));

    margin-inline: auto;
    inline-size: 100%;
    max-inline-size: var(--measure);
  }

  main {
    padding-block-end: calc(var(--spacing) * 24);
  }

  @keyframes page-fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes page-fade-out {
    to {
      opacity: 0;
    }
  }

  @supports (animation-timeline: scroll()) {
    .page {
      --page-fade: calc(var(--spacing) * 12);
    }

    .page::before,
    .page::after {
      content: '';
      position: fixed;
      z-index: 1;
      inset-inline: 0;
      block-size: var(--page-fade);
      pointer-events: none;
      animation-fill-mode: both;
      animation-timing-function: linear;
      animation-timeline: scroll(root block);
    }

    /* Eased stops: a bare two-stop gradient bands visibly against flat colour. */
    .page::before {
      inset-block-start: 0;
      background: linear-gradient(
        to bottom,
        var(--color-content),
        color-mix(in oklab, var(--color-content) 80%, transparent) 42%,
        color-mix(in oklab, var(--color-content) 38%, transparent) 70%,
        transparent
      );
      animation-name: page-fade-in;
      animation-range: 0 var(--page-fade);
    }

    .page::after {
      inset-block-end: 0;
      background: linear-gradient(
        to top,
        var(--color-content),
        color-mix(in oklab, var(--color-content) 80%, transparent) 42%,
        color-mix(in oklab, var(--color-content) 38%, transparent) 70%,
        transparent
      );
      animation-name: page-fade-out;
      animation-range: calc(100% - var(--page-fade)) 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .page::before,
    .page::after {
      animation: none;
    }
  }

  div:has(> main) {
    display: grid;
    margin-inline: 0;
    inline-size: 100%;
    grid-template-columns: minmax(0, 1fr);
    gap: calc(var(--spacing) * 10);
  }

  @media (width >= 64rem) {
    div {
      max-inline-size: var(--page);
    }

    div:has(> main) {
      grid-template-columns: var(--side-nav) minmax(0, 1fr);
      gap: var(--side-nav-gap);
    }
  }
</style>
