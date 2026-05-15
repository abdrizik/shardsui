<script lang="ts">
  import ComponentsGrid from '$lib/components/components-grid.svelte'
  import Sidebar from '$lib/components/sidebar.svelte'
  import { docs } from '$lib/data/docs'
</script>

<div>
  <Sidebar />

  <main>
    <ComponentsGrid components={docs.component} />
  </main>
</div>

<style>
  div {
    margin-inline: auto;
    display: grid;
    inline-size: 100%;
    max-inline-size: var(--width-site);
    grid-template-columns: minmax(0, 1fr);
    gap: calc(var(--spacing) * 14);
  }

  main {
    display: flex;
    flex-direction: column;
  }

  @media (width >= 64rem) {
    div {
      grid-template-columns: var(--width-rail) minmax(0, 1fr);
      gap: calc(var(--spacing) * 16);
    }
  }
</style>
