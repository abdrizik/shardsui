<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let {
    value = 0,
    allowChange = false,
    onValueChange = undefined
  }: {
    value?: number
    allowChange?: boolean
    onValueChange?: (value: string | number | null) => void
  } = $props()
</script>

<Tabs.Root
  bind:value={() => value, (next) => allowChange && (value = next as number)}
  {onValueChange}
  data-testid="root"
>
  <Tabs.List>
    <Tabs.Tab value={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab value={1}>Tab 2</Tabs.Tab>
    <Tabs.Tab value={2}>Tab 3</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value={0} keepMounted>Panel 1</Tabs.Panel>
  <Tabs.Panel value={1} keepMounted>Panel 2</Tabs.Panel>
  <Tabs.Panel value={2} keepMounted>Panel 3</Tabs.Panel>
</Tabs.Root>
