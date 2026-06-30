<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
</script>

<Tabs.Root value="missing">
  <Tabs.List>
    <Tabs.Tab value="one">One</Tabs.Tab>
    <Tabs.Indicator data-testid="bubble">
      {#snippet children(state)}
        <span
          data-testid="indicator-state"
          data-active-tab-position={state.activeTabPosition === null ? 'null' : 'set'}
          data-active-tab-size={state.activeTabSize === null ? 'null' : 'set'}
        ></span>
      {/snippet}
    </Tabs.Indicator>
  </Tabs.List>
</Tabs.Root>
