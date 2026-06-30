<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let {
    value = $bindable('one'),
    css = '',
    ontransitionend = undefined,
    onanimationend = undefined
  }: {
    value?: string
    css?: string
    ontransitionend?: () => void
    onanimationend?: () => void
  } = $props()
</script>

{@html `<style>${css}</style>`}

<Tabs.Root bind:value>
  <Tabs.List>
    <Tabs.Tab value="one">One</Tabs.Tab>
    <Tabs.Tab value="two">Two</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="one">Panel one</Tabs.Panel>
  <Tabs.Panel
    value="two"
    class="animation-test-panel"
    data-testid="panel-two"
    {ontransitionend}
    {onanimationend}
  >
    Panel two
  </Tabs.Panel>
</Tabs.Root>
