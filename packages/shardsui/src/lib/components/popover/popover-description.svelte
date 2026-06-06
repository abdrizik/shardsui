<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { PopoverContext } from './context'

  type Props = PartProps<[], 'p'>

  const uid = $props.id()

  let { as = 'p', ref = $bindable(null), id = uid, children, ...rest }: Props = $props()

  const popover = PopoverContext.get()

  function registerDescriptionId() {
    popover.descriptionId = id
    return () => {
      popover.descriptionId = undefined
    }
  }
</script>

<svelte:element this={as} bind:this={ref} {@attach registerDescriptionId} {id} {...rest}>
  {@render children?.()}
</svelte:element>
