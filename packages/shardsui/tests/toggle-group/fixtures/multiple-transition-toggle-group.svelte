<script lang="ts">
  import { Toggle } from '$lib/components/toggle'
  import { ToggleGroup } from '$lib/components/toggle-group'
  import { Toolbar } from '$lib/components/toolbar'

  let { multiple = false, inToolbar = false }: { multiple?: boolean; inToolbar?: boolean } =
    $props()

  let value = $state<string[]>(['one'])
</script>

{#snippet group()}
  <ToggleGroup bind:value {multiple} data-testid="toggle-group">
    <Toggle value="one">One</Toggle>
    <Toggle value="two">Two</Toggle>
  </ToggleGroup>
{/snippet}

{#if inToolbar}
  <Toolbar.Root>
    <Toolbar.Group>
      {@render group()}
    </Toolbar.Group>
  </Toolbar.Root>
{:else}
  {@render group()}
{/if}
