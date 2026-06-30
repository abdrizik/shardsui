<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { value = $bindable(0), onValueChange = undefined } = $props()
</script>

<Tabs.Root bind:value {onValueChange}>
  <Tabs.List>
    <Tabs.Tab value={0}>Tab 0</Tabs.Tab>
    <Tabs.Tab value={1}>Tab 1</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value={0}>Panel 0</Tabs.Panel>
  <Tabs.Panel value={1}>Panel 1</Tabs.Panel>
</Tabs.Root>
