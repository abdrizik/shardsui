<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  import type { TabsValue } from '$lib/components/tabs'

  let { onValueChange = undefined }: { onValueChange?: (value: TabsValue) => void } = $props()

  let value = $state<TabsValue | undefined>(undefined)
</script>

<Tabs.Root bind:value={() => value, () => {}} {onValueChange} data-testid="root">
  <Tabs.List>
    <Tabs.Tab value={0} disabled>Tab 0</Tabs.Tab>
    <Tabs.Tab value={1}>Tab 1</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
