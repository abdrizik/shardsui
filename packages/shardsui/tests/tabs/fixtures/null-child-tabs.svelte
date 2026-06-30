<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
</script>

<Tabs.Root value={0}>
  {#if false}
    <span></span>
  {/if}
  <Tabs.List>
    <Tabs.Tab value={1} />
  </Tabs.List>
</Tabs.Root>
