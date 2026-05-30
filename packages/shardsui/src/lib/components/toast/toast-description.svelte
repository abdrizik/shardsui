<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import type { ToastDescriptionState } from './context'
  import { ToastLabelPart } from './label-part.svelte'

  type Props = PartProps<[ToastDescriptionState], 'p'>

  const uid = $props.id()

  let { as = 'p', ref = $bindable(null), id = uid, children, ...rest }: Props = $props()

  const label = new ToastLabelPart(() => ({
    part: 'description',
    id,
    hasChildren: Boolean(children)
  }))

  const toastState: ToastDescriptionState = $derived({ type: label.type })
</script>

{#if label.shouldRender}
  <svelte:element this={as} bind:this={ref} data-type={label.type} {id} {...rest}>
    {#if children}
      {@render children(toastState)}
    {:else}
      {label.content}
    {/if}
  </svelte:element>
{/if}
