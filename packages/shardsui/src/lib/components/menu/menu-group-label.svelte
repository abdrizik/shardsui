<script lang="ts">
  import { registerLabelId } from '$lib/internal/register-label-id'
  import type { PartProps } from '$lib/internal/types'
  import { MenuGroupContext } from './context'

  type Props = PartProps

  const uid = $props.id()

  let { as = 'div', ref = $bindable(null), id = uid, children, ...rest }: Props = $props()

  const group = MenuGroupContext.get()
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {@attach registerLabelId(group, id)}
  {id}
  role="presentation"
  {...rest}
>
  {@render children?.()}
</svelte:element>
