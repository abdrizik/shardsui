<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { value = $bindable(null), onValueChange = undefined } = $props()
</script>

<Tabs.Root bind:value {onValueChange}>
  <Tabs.List>
    <Tabs.Tab value={0}>Tab 0</Tabs.Tab>
    <Tabs.Tab value={1}>Tab 1</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
