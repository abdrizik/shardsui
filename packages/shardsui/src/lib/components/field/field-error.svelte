<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { Transition } from '$lib/internal/transition-status.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { FieldContext, type FieldErrorState } from './context'
  import { getFieldState } from './field.svelte'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import type { Attachment } from 'svelte/attachments'

  type Props = PartProps<[FieldErrorState]> & {
    match?: boolean | keyof ValidityState
  }

  const uid = $props.id()

  let { as = 'div', ref = $bindable(null), id = uid, match, children, ...rest }: Props = $props()

  const field = FieldContext.get()
  const labelable = LabelableContext.get()

  const matchedValidityKey = $derived(typeof match === 'string' ? match : null)

  const isVisible = $derived.by(() => {
    if (match === true) return true
    if (field.disabled) return false
    if (matchedValidityKey) {
      return Boolean(field.validityData.state[matchedValidityKey])
    }
    return field.hasFormError || field.validityData.state.valid === false
  })

  const currentMessages = $derived.by<string | string[]>(() => {
    if (!matchedValidityKey && field.hasFormError) {
      const formError = field.formError
      if (!Array.isArray(formError)) return formError ?? ''
      return formError.length > 1 ? formError : (formError[0] ?? '')
    }
    const clientErrors = field.validityData.errors
    if (clientErrors.length > 1) return clientErrors
    return field.validityData.error
  })

  let lastShown = $state.raw<string | string[]>('')

  const messages = $derived(isVisible ? currentMessages : lastShown)

  const transition = new Transition(() => ({ open: isVisible }))

  const fieldState: FieldErrorState = $derived({
    ...getFieldState(field),
    disabled: field.disabled,
    transitionStatus: transition.status
  })

  openChangeComplete(() => ({
    open: isVisible,
    element: ref,
    onComplete: () => {
      if (!isVisible) transition.mounted = false
    }
  }))

  const publishMessageId: Attachment = () =>
    isVisible && id ? labelable.registerMessageId(id) : undefined

  $effect(() => {
    if (isVisible) lastShown = currentMessages
  })

  const stateAttrs = $derived(
    dataAttrs({
      'starting-style': transition.status === 'starting',
      'ending-style': transition.status === 'ending'
    })
  )
</script>

{#if transition.mounted}
  <svelte:element
    this={as}
    bind:this={ref}
    {...field.stateAttrs}
    {...stateAttrs}
    {@attach publishMessageId}
    {id}
    {...rest}
  >
    {#if children}
      {@render children(fieldState)}
    {:else if Array.isArray(messages)}
      <ul>
        {#each messages as message, index (index)}
          <li>{message}</li>
        {/each}
      </ul>
    {:else}
      {messages}
    {/if}
  </svelte:element>
{/if}
