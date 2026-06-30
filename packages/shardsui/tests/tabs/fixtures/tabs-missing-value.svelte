<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { onValueChange = undefined } = $props()
</script>

<Tabs.Root {onValueChange}>
  <Tabs.List>
    <Tabs.Tab value={1}>Tab 1</Tabs.Tab>
    <Tabs.Tab value={2}>Tab 2</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
