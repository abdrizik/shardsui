<script lang="ts">
  import { Toggle } from '$lib/components/toggle'
  import { ToggleGroup } from '$lib/components/toggle-group'

  let { onValueChange }: { onValueChange?: (value: string[]) => void } = $props()

  const value: string[] = []
</script>

<ToggleGroup bind:value={() => value, () => {}} {onValueChange}>
  <Toggle value="one">One</Toggle>
  <Toggle value="two">Two</Toggle>
  <Toggle value="three">Three</Toggle>
</ToggleGroup>
