<script lang="ts" generics="Payload = unknown">
  import { untrack } from 'svelte'
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { REASONS } from '$lib/internal/reasons'
  import { DialogContext, type DialogTriggerState } from './context'
  import type { DialogHandle } from './handle.svelte'
  import type { DialogRoot } from './dialog.svelte'

  type Props = PartProps<
    [DialogTriggerState],
    'button',
    'onclick' | 'onkeydown' | 'onkeyup' | 'onpointerdown'
  > & {
    disabled?: boolean
    handle?: DialogHandle<Payload>
    payload?: Payload
  }

  const uid = $props.id()

  let {
    as = 'button',
    ref = $bindable(null),
    id = uid,
    disabled = false,
    handle,
    payload,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const resolvedDialog = untrack(() => (handle ? DialogContext.getOr() : DialogContext.get()))
  const dialog: DialogRoot = $derived(handle?.state ?? resolvedDialog!)

  const isMountedByThisTrigger = $derived(dialog.activeTriggerId === id && dialog.mounted)
  const isOpen = $derived(dialog.open && dialog.activeTriggerId === id)
  const ownsOrSoloOpen = $derived(
    isOpen || (dialog.open && dialog.activeTriggerId == null && dialog.triggerElements.size === 1)
  )

  $effect(() => {
    if (!ref) return
    const unregister = dialog.registerTrigger(id, ref)
    untrack(() => {
      const activeId = dialog.activeTriggerId
      if (activeId === id) {
        if (!handle) dialog.triggerElement = ref
        return
      }
      if (activeId == null && dialog.open) {
        dialog.setActiveTriggerId(id)
        dialog.triggerElement = ref
      }
    })
    return unregister
  })

  $effect(() => {
    if (isMountedByThisTrigger) {
      dialog.payload = payload
    }
  })

  const btn = new Button(() => ({
    disabled,
    as,
    onclick: chain(onclick, toggleOpen),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown: chain(onpointerdown, forwardOpenPointerDown)
  }))

  const dialogState: DialogTriggerState = $derived({ disabled, open: isOpen })

  const stateAttrs = $derived(
    dataAttrs({
      'popup-open': isOpen,
      disabled
    })
  )

  function toggleOpen(event: MouseEvent) {
    dialog.openInteractionHandlers?.onclick(event)
    if (dialog.open && dialog.activeTriggerId !== id && ref) {
      dialog.triggerElement = ref
      dialog.setActiveTriggerId(id)
      dialog.payload = payload
      return
    }
    const next = !dialog.open
    if (next && ref) {
      dialog.triggerElement = ref
      dialog.payload = payload
    }
    dialog.setOpen(next, REASONS.triggerPress, event)
  }

  function forwardOpenPointerDown(event: PointerEvent) {
    dialog.openInteractionHandlers?.onpointerdown(event)
  }
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {id}
  aria-haspopup="dialog"
  aria-expanded={isOpen}
  aria-controls={ownsOrSoloOpen ? dialog.popupId : undefined}
  data-shards-ui-click-trigger=""
  {...rest}
>
  {@render children?.(dialogState)}
</svelte:element>
