<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Dialog } from '$lib/components/dialog'

  let {
    shape = 'contained',
    open = $bindable(false),
    onOpenChange = undefined,
    onOpenChangeComplete = undefined,
    modal = true,
    disablePointerDismissal = false,
    includeBackdrop = false,
    container = undefined,
    popupClass = undefined,
    popupTestId = 'dialog-popup',
    triggerText = 'Open',
    children = undefined
  }: {
    shape?: 'contained' | 'detached' | 'multiple-detached'
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    modal?: boolean | 'trap-focus'
    disablePointerDismissal?: boolean
    includeBackdrop?: boolean
    container?: HTMLElement | null
    popupClass?: string
    popupTestId?: string
    triggerText?: string
    children?: Snippet
  } = $props()

  const handle = new Dialog.Handle()
</script>

{#snippet portal()}
  <Dialog.Portal {container}>
    {#if includeBackdrop}
      <Dialog.Backdrop data-testid="backdrop" style="position:fixed;z-index:10;inset:0;" />
    {/if}
    <Dialog.Popup data-testid={popupTestId} class={popupClass} style="position:fixed;z-index:10;">
      {#if children}
        {@render children()}
      {:else}
        <Dialog.Title>title text</Dialog.Title>
        <Dialog.Description>description text</Dialog.Description>
        <p>Dialog content</p>
        <Dialog.Close>Close</Dialog.Close>
      {/if}
    </Dialog.Popup>
  </Dialog.Portal>
{/snippet}

{#if shape === 'contained'}
  <Dialog.Root bind:open {modal} {disablePointerDismissal} {onOpenChange} {onOpenChangeComplete}>
    <Dialog.Trigger data-testid="trigger">{triggerText}</Dialog.Trigger>
    {@render portal()}
  </Dialog.Root>
{:else}
  <Dialog.Trigger {handle} data-testid="trigger">{triggerText}</Dialog.Trigger>
  {#if shape === 'multiple-detached'}
    <Dialog.Trigger {handle} data-testid="trigger-2">Open another</Dialog.Trigger>
  {/if}
  <Dialog.Root
    {handle}
    bind:open
    {modal}
    {disablePointerDismissal}
    {onOpenChange}
    {onOpenChangeComplete}
  >
    {@render portal()}
  </Dialog.Root>
{/if}
