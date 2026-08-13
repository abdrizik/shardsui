<script lang="ts">
  import GitHub from '$lib/components/icons/github.svelte'
  import Npm from '$lib/components/icons/npm.svelte'
  import { github, npm, version } from '$lib/data/site'
</script>

<div class="site-links">
  <span>v{version}</span>
  <div class="site-links-icons">
    <a href={npm} rel="external noopener noreferrer" aria-label="npm">
      <Npm />
    </a>
    <a href={github} rel="external noopener noreferrer" aria-label="GitHub">
      <GitHub />
    </a>
  </div>
</div>

<style>
  .site-links {
    display: none;
    align-items: center;
    gap: calc(var(--spacing) * 4);
  }

  .site-links-icons {
    display: flex;
    align-items: center;
    margin-inline-start: calc(var(--spacing) * -1.5);
  }

  @media (width >= 64rem) {
    .site-links {
      display: flex;
    }
  }

  span {
    border-inline-end: var(--border-hairline) solid var(--color-border);
    padding-inline-end: calc(var(--spacing) * 4);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
    color: var(--color-gray-700);
  }

  a {
    display: inline-flex;
    border-radius: var(--radius-md);
    padding: calc(var(--spacing) * 1.5);
    color: var(--color-gray-700);
    transition: color 150ms var(--ease-out);
  }

  a:hover {
    color: var(--color-gray-950);
  }

  a:focus-visible {
    outline: 2px solid var(--color-gray-900);
    outline-offset: calc(var(--spacing) * 0.5);
  }
</style>
