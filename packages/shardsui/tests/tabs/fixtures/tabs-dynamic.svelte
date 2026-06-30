<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let {
    value = $bindable(undefined),
    onValueChange = undefined,
    disableFirst = false,
    showFirst = true
  } = $props()
</script>

<Tabs.Root bind:value {onValueChange}>
  <Tabs.List>
    {#if showFirst}
      <Tabs.Tab value={0} disabled={disableFirst}>Tab 0</Tabs.Tab>
    {/if}
    <Tabs.Tab value={1}>Tab 1</Tabs.Tab>
    <Tabs.Tab value={2}>Tab 2</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
