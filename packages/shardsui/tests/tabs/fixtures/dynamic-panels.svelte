<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { value = $bindable(undefined), onValueChange = undefined, disableFirst = false } = $props()
</script>

<Tabs.Root bind:value {onValueChange} data-testid="root">
  <Tabs.List>
    <Tabs.Tab value={0} disabled={disableFirst}>Tab 0</Tabs.Tab>
    <Tabs.Tab value={1}>Tab 1</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value={0} keepMounted>Panel 0</Tabs.Panel>
  <Tabs.Panel value={1} keepMounted>Panel 1</Tabs.Panel>
</Tabs.Root>
