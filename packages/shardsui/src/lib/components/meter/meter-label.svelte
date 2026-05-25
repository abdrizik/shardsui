<script lang="ts">
  import { registerLabelId } from '$lib/internal/register-label-id'
  import type { PartProps } from '$lib/internal/types'
  import { MeterContext } from './context'

  type Props = PartProps<[], 'span'>

  const uid = $props.id()

  let { as = 'span', ref = $bindable(null), id = uid, children, ...rest }: Props = $props()

  const meter = MeterContext.get()
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {@attach registerLabelId(meter, id)}
  {id}
  role="presentation"
  {...rest}
>
  {@render children?.()}
</svelte:element>
