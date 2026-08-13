<script lang="ts">
  import { page } from '$app/state'
  import { resolve } from '$app/paths'
  import Shapes from '$lib/components/shapes.svelte'
</script>

<main>
  {#if page.status === 404}
    <h1>
      4
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="12" />
      </svg>
      4
    </h1>
    <p>This page doesn't exist.</p>
  {:else}
    <h1>{page.status}</h1>
    <p>Something went wrong</p>
    <p>{page.error?.message ?? 'An unexpected error occurred.'}</p>
  {/if}
  <a href={resolve('/(docs)/svelte/[slug]', { slug: 'quick-start' })}>Back to docs</a>
</main>

<Shapes />

<style>
  main {
    display: flex;
    min-block-size: 80dvh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  h1 {
    font-size: clamp(calc(var(--spacing) * 28), 15vw, calc(var(--spacing) * 36));
    line-height: 1;
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--tracking-tight);
    text-wrap: balance;
    color: var(--color-gray-200);
    user-select: none;
  }

  h1:has(svg) {
    display: flex;
    align-items: center;
    gap: clamp(calc(var(--spacing) * 3), 2vw, calc(var(--spacing) * 4));
  }

  h1 svg {
    inline-size: clamp(calc(var(--spacing) * 18), 12vw, calc(var(--spacing) * 24));
    block-size: clamp(calc(var(--spacing) * 18), 12vw, calc(var(--spacing) * 24));
  }

  main > p:first-of-type {
    margin-block-start: calc(var(--spacing) * 4);
    font-size: var(--text-lg);
    font-weight: var(--font-weight-medium);
    text-wrap: balance;
  }

  main > p:nth-of-type(2) {
    margin-block-start: calc(var(--spacing) * 2);
    max-inline-size: 40ch;
    font-size: var(--text-sm);
    line-height: 1.5;
    text-wrap: pretty;
    color: var(--color-gray-600);
  }

  a {
    margin-block-start: calc(var(--spacing) * 10);
    font-size: var(--text-sm);
  }

  a:hover {
    text-decoration: underline;
    text-decoration-thickness: from-font;
    text-underline-position: from-font;
    text-decoration-skip-ink: auto;
  }
</style>
