<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let {
    activateOnFocus = false,
    onValueChange = undefined
  }: { activateOnFocus?: boolean; onValueChange?: (value: unknown) => void } = $props()

  let value = $state(0)
</script>

<Tabs.Root
  {value}
  onValueChange={(next) => {
    onValueChange?.(next)
    Promise.resolve().then(() => (value = next as number))
  }}
>
  <Tabs.List {activateOnFocus}>
    <Tabs.Tab value={0}>First</Tabs.Tab>
    <Tabs.Tab value={1} disabled>Disabled</Tabs.Tab>
    <Tabs.Tab value={2}>Third</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
