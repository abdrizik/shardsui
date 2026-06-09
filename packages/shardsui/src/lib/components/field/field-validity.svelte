<script lang="ts">
  import { Transition } from '$lib/internal/transition-status.svelte'
  import type { Snippet } from 'svelte'
  import { FieldContext, type FieldValidityState } from './context'

  type Props = {
    children: Snippet<[FieldValidityState]>
  }

  let { children }: Props = $props()

  const field = FieldContext.get()

  const validityData = $derived(field.combinedValidityData)

  const transition = new Transition(() => ({ open: validityData.state.valid === false }))

  const fieldState = $derived<FieldValidityState>({
    validity: validityData.state,
    error: validityData.error,
    errors: validityData.errors,
    value: validityData.value,
    initialValue: validityData.initialValue,
    transitionStatus: transition.status
  })
</script>

{@render children(fieldState)}
