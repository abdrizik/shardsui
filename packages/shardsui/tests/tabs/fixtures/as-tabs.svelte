<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let {
    rootAs = undefined,
    listAs = undefined,
    tabAs = undefined,
    panelAs = undefined,
    indicatorAs = undefined
  }: {
    rootAs?: keyof HTMLElementTagNameMap
    listAs?: keyof HTMLElementTagNameMap
    tabAs?: keyof HTMLElementTagNameMap
    panelAs?: keyof HTMLElementTagNameMap
    indicatorAs?: keyof HTMLElementTagNameMap
  } = $props()
</script>

<Tabs.Root as={rootAs} value={0} data-testid="root">
  <Tabs.List as={listAs} data-testid="list">
    <Tabs.Tab as={tabAs} value={0} data-testid="tab">One</Tabs.Tab>
    <Tabs.Indicator as={indicatorAs} data-testid="indicator" />
  </Tabs.List>
  <Tabs.Panel as={panelAs} value={0} data-testid="panel">Panel One</Tabs.Panel>
</Tabs.Root>
