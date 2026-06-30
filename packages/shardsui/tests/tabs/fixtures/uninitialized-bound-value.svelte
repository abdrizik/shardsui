<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let { value = $bindable() } = $props()
</script>

<Tabs.Root bind:value>
  <Tabs.List>
    <Tabs.Tab value={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab value={1}>Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value={0}>Panel 1</Tabs.Panel>
  <Tabs.Panel value={1}>Panel 2</Tabs.Panel>
</Tabs.Root>

<output data-testid="bound-value">{String(value)}</output>
