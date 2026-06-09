<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import type { PartProps } from '$lib/internal/types'
  import type { Attachment } from 'svelte/attachments'
  import { FieldItemContext, FieldContext, type FieldRootState } from './context'
  import { getFieldState, getFieldStateAttrs } from './field.svelte'

  type Props = PartProps<[FieldRootState], 'p'>

  const uid = $props.id()

  let { as = 'p', ref = $bindable(null), id = uid, children, ...rest }: Props = $props()

  const field = FieldContext.get()
  const item = FieldItemContext.getOr()
  const labelable = LabelableContext.get()

  const publishMessageId: Attachment = () => (id ? labelable.registerMessageId(id) : undefined)

  const disabled = $derived(field.disabled || (item?.disabled ?? false))

  const fieldState = $derived({ ...getFieldState(field), disabled })

  const stateAttrs = $derived(dataAttrs({ disabled, ...getFieldStateAttrs(field) }))
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} {@attach publishMessageId} {id} {...rest}>
  {@render children?.(fieldState)}
</svelte:element>
