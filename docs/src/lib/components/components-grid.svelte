<script lang="ts">
  import { resolve } from '$app/paths'
  import type { ComponentDoc } from '$lib/data/docs'
  import CategoryThumbnail from '$lib/components/category-thumbnail.svelte'

  let { components }: { components: readonly ComponentDoc[] } = $props()

  const groups = $derived(
    [...Map.groupBy(components, (c) => c.title[0].toUpperCase())].sort(([a], [b]) =>
      a.localeCompare(b)
    )
  )
</script>

<section>
  <h2>Components</h2>

  <div>
    {#each groups as [letter, items] (letter)}
      <div>
        <h3>{letter}</h3>
        <ul role="list">
          {#each items as component (component.slug)}
            <li>
              <a href={resolve('/(docs)/svelte/[slug]', { slug: component.slug })}>
                <CategoryThumbnail slug={component.slug} />
                <span>{component.title}</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 6);
  }

  h2 {
    font-size: var(--text-code);
    font-weight: var(--font-weight-medium);
    color: var(--color-gray-900);
  }

  section > div {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 20);
  }

  section > div > div {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 4);
  }

  h3 {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-gray-600);
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
    column-gap: calc(var(--spacing) * 3);
    row-gap: calc(var(--spacing) * 8);
  }

  ul a {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 2);
  }

  ul a:focus-visible {
    outline: 2px solid var(--color-gray-900);
    outline-offset: calc(var(--spacing) * -0.5);
  }

  ul a span {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
  }

  ul a:hover span {
    color: var(--color-gray-900);
  }
</style>
