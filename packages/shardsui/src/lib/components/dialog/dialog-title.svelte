<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { DialogContext } from './context'

  type Props = PartProps<[], 'h2'>

  const uid = $props.id()

  let { as = 'h2', ref = $bindable(null), id = uid, children, ...rest }: Props = $props()

  const dialog = DialogContext.get()

  function registerTitleId() {
    dialog.titleId = id
    return () => {
      dialog.titleId = undefined
    }
  }
</script>

<svelte:element this={as} bind:this={ref} {@attach registerTitleId} {id} {...rest}>
  {@render children?.()}
</svelte:element>
