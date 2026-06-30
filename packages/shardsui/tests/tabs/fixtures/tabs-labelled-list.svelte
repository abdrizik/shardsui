<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { ariaLabel = undefined, ariaLabelledby = undefined } = $props()
</script>

{#if ariaLabelledby}
  <h3 id={ariaLabelledby}>complex name</h3>
{/if}
<Tabs.Root>
  <Tabs.List aria-label={ariaLabel} aria-labelledby={ariaLabelledby}>
    <Tabs.Tab value={0}>Tab 0</Tabs.Tab>
    <Tabs.Tab value={1}>Tab 1</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value={0} keepMounted>Panel 0</Tabs.Panel>
  <Tabs.Panel value={1} keepMounted>Panel 1</Tabs.Panel>
</Tabs.Root>
