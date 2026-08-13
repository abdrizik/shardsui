<script lang="ts">
  import { resolve } from '$app/paths'
  import Header from '$lib/components/header.svelte'
  import { getDemoComponent } from '$lib/components/content/demos'
  import { docs } from '$lib/data/docs'

  const { data } = $props()

  const components = docs.component.map(({ slug, title }) => ({
    slug,
    title,
    Demo: getDemoComponent(`${slug}/hero`)
  }))

  const demos = $derived(
    data.demoEntries.map(({ name, title }) => ({
      name,
      title,
      Demo: getDemoComponent(name)
    }))
  )
</script>

<div>
  <Header />

  <header>
    <h1>gallery</h1>
    <p>Hero and example demos for every component.</p>
  </header>

  <main>
    <div>
      {#each components as { slug, title, Demo } (slug)}
        <section>
          <h2>
            <a href={resolve('/(docs)/svelte/[slug]', { slug })}>{title}</a>
          </h2>
          <div>
            {#if Demo}
              <Demo />
            {/if}
          </div>
        </section>
      {/each}
    </div>

    <section>
      <h2>demos</h2>

      <div data-tall>
        {#each demos as { name, title, Demo } (name)}
          <section>
            <h3>{title}</h3>
            <div>
              {#if Demo}
                <Demo />
              {/if}
            </div>
          </section>
        {/each}
      </div>
    </section>
  </main>
</div>

<style>
  div:has(> header) {
    margin-inline: auto;
    inline-size: 100%;
    max-inline-size: var(--width-site);
  }

  header {
    margin-block-end: calc(var(--spacing) * 12);
  }

  h1 {
    font-size: clamp(var(--text-2xl), calc(var(--spacing) * 3) + 2vw, var(--text-3xl));
    line-height: 1.15;
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--tracking-tight);
    text-wrap: balance;
  }

  header p {
    margin-block-start: calc(var(--spacing) * 3);
    max-inline-size: 36rem;
    line-height: var(--leading-snug);
    text-wrap: pretty;
    color: var(--color-gray-600);
  }

  main {
    --hero-min: 18rem;

    display: flex;
    flex-direction: column;
  }

  main > section {
    margin-block-start: calc(var(--spacing) * 16);
  }

  main > section > h2 {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 4);
    margin-block-end: calc(var(--spacing) * 8);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-gray-500);
  }

  main > section > h2::before,
  main > section > h2::after {
    content: '';
    flex: 1;
    block-size: var(--border-hairline);
    background: var(--color-border);
  }

  main > div,
  main > section > div[data-tall] {
    display: grid;
    overflow-x: clip;
    border-block-start: var(--border-hairline) solid var(--color-border);
    border-inline-start: var(--border-hairline) solid var(--color-border);
  }

  main > div {
    grid-template-columns: repeat(
      auto-fill,
      minmax(min(100%, max(var(--hero-min), 100% / 3)), 1fr)
    );
  }

  main > section > div[data-tall] {
    grid-template-columns: minmax(0, 1fr);
  }

  @media (width >= 40rem) {
    main > section > div[data-tall] {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  main > div section,
  main > section > div[data-tall] section {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 4);
    min-inline-size: 0;
    padding: calc(var(--spacing) * 5);
    border-inline-end: var(--border-hairline) solid var(--color-border);
    border-block-end: var(--border-hairline) solid var(--color-border);
    background: var(--color-content);
  }

  main > section > div[data-tall] section {
    block-size: calc(var(--hero-min) * 1.5);
  }

  main > div section {
    aspect-ratio: 1 / 1;
  }

  main > div section > div,
  main > section > div[data-tall] section > div {
    display: flex;
    flex: 1;
    min-inline-size: 0;
    min-block-size: 0;
    align-items: center;
    justify-content: center;
    overflow: clip;
  }

  main > div h2 {
    font-size: var(--text-code);
    font-weight: var(--font-weight-medium);
  }

  main > div h2 a:hover {
    text-decoration: underline;
    text-decoration-thickness: from-font;
    text-underline-position: from-font;
    text-decoration-skip-ink: auto;
  }

  main > section > div[data-tall] h3 {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
  }
</style>
