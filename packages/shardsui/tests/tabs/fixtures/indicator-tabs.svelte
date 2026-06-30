<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let {
    value = $bindable(2),
    rootStyle = undefined,
    listStyle = undefined,
    tabStyle = undefined,
    firstTabStyle = undefined,
    firstTabAs = 'button'
  }: {
    value?: number
    rootStyle?: string
    listStyle?: string
    tabStyle?: string
    firstTabStyle?: string
    firstTabAs?: 'button' | 'a'
  } = $props()
</script>

<Tabs.Root bind:value style={rootStyle}>
  <Tabs.List data-testid="tab-list" style={listStyle}>
    <Tabs.Tab as={firstTabAs} value={1} data-testid="first-tab" style={firstTabStyle ?? tabStyle}>
      One
    </Tabs.Tab>
    <Tabs.Tab value={2} style={tabStyle}>Two</Tabs.Tab>
    <Tabs.Tab value={3} style={tabStyle}>Three</Tabs.Tab>
    <Tabs.Indicator data-testid="bubble" />
  </Tabs.List>
</Tabs.Root>
