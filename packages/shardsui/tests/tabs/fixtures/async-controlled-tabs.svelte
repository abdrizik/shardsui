<script lang="ts">
  import { Tabs, type TabsValue } from '$lib/components/tabs'

  let {
    activateOnFocus = false,
    onValueChange
  }: { activateOnFocus?: boolean; onValueChange?: (value: TabsValue) => void } = $props()

  let value = $state<TabsValue>(0)
</script>

<Tabs.Root
  {value}
  onValueChange={(next) => {
    onValueChange?.(next)
    Promise.resolve().then(() => (value = next))
  }}
>
  <Tabs.List {activateOnFocus}>
    <Tabs.Tab value={0}>First</Tabs.Tab>
    <Tabs.Tab value={1} disabled>Disabled</Tabs.Tab>
    <Tabs.Tab value={2}>Third</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
