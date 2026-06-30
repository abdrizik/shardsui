<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  import type { TabsValue } from '$lib/components/tabs'

  let { value = 0 }: { value?: TabsValue } = $props()
</script>

<Tabs.Root {value}>
  <Tabs.List>
    <Tabs.Tab value={0}>
      {#snippet children(state)}
        <span
          data-testid="tab-state-0"
          data-active={state.active}
          data-direction={state.activationDirection}
        ></span>
      {/snippet}
    </Tabs.Tab>
    <Tabs.Tab value={1}>
      {#snippet children(state)}
        <span
          data-testid="tab-state-1"
          data-active={state.active}
          data-direction={state.activationDirection}
        ></span>
      {/snippet}
    </Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
