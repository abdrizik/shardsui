<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  import { ToggleGroup } from '$lib/components/toggle-group'
  import { Toggle } from '$lib/components/toggle'

  let {
    value = $bindable(['one'] as string[]),
    onValueChange = undefined,
    multiple = false,
    twoDisabled = false
  }: {
    value?: string[]
    onValueChange?: (value: string[]) => void
    multiple?: boolean
    twoDisabled?: boolean
  } = $props()
</script>

<Toolbar.Root>
  <ToggleGroup bind:value {multiple} {onValueChange}>
    <Toggle value="one" data-testid="one">One</Toggle>
    <Toggle value="two" data-testid="two" disabled={twoDisabled}>Two</Toggle>
    <Toggle value="three" data-testid="three">Three</Toggle>
  </ToggleGroup>
</Toolbar.Root>
