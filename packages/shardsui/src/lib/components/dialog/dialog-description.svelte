<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { DialogContext } from './context'

  type Props = PartProps<[], 'p'>

  const uid = $props.id()

  let { as = 'p', ref = $bindable(null), id = uid, children, ...rest }: Props = $props()

  const dialog = DialogContext.get()

  function registerDescriptionId() {
    dialog.descriptionId = id
    return () => {
      dialog.descriptionId = undefined
    }
  }
</script>

<svelte:element this={as} bind:this={ref} {@attach registerDescriptionId} {id} {...rest}>
  {@render children?.()}
</svelte:element>
