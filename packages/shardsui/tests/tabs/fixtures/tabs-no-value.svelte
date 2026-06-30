<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { onValueChange = undefined } = $props()
</script>

<Tabs.Root {onValueChange}>
  <Tabs.List>
    <Tabs.Tab value={0}>Tab 0</Tabs.Tab>
    <Tabs.Tab value={1}>Tab 1</Tabs.Tab>
    <Tabs.Tab value={2}>Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value={0} keepMounted>Panel 0</Tabs.Panel>
  <Tabs.Panel value={1} keepMounted>Panel 1</Tabs.Panel>
  <Tabs.Panel value={2} keepMounted>Panel 2</Tabs.Panel>
</Tabs.Root>
