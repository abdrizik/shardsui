<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { onValueChange = undefined, enableSecond = false } = $props()
</script>

<Tabs.Root {onValueChange}>
  <Tabs.List>
    <Tabs.Tab value={0} disabled>Tab 0</Tabs.Tab>
    <Tabs.Tab value={1} disabled={!enableSecond}>Tab 1</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
