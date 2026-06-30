<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let {
    onValueChange = undefined,
    disabledSecond = false
  }: { onValueChange?: (value: unknown) => void; disabledSecond?: boolean } = $props()

  let value = $state(0)
</script>

<Tabs.Root bind:value {onValueChange}>
  <Tabs.List activateOnFocus>
    <Tabs.Tab value={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab value={1} disabled={disabledSecond}>Tab 2</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
