<script lang="ts">
  import { Toggle } from '$lib/components/toggle'
  import { ToggleGroup } from '$lib/components/toggle-group'
  import type { Orientation } from '$lib/internal/types'

  let {
    value,
    multiple = false,
    disabled = false,
    orientation = 'horizontal',
    onValueChange
  }: {
    value?: string[]
    multiple?: boolean
    disabled?: boolean
    orientation?: Orientation
    onValueChange?: (value: string[]) => void
  } = $props()
</script>

<ToggleGroup {value} {multiple} {disabled} {orientation} {onValueChange}>
  <Toggle value="one">One</Toggle>
  <Toggle value="two">Two</Toggle>
  <Toggle value="three">Three</Toggle>
</ToggleGroup>
