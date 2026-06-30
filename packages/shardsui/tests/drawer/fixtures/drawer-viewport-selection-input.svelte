<script lang="ts">
  import { Drawer } from '$lib/components/drawer'

  let {
    variant = 'input'
  }: {
    variant?: 'input' | 'textarea' | 'contenteditable' | 'text'
  } = $props()
</script>

<Drawer.Root open swipeDirection="down">
  <Drawer.Portal>
    <Drawer.Backdrop data-testid="backdrop" />
    <Drawer.Viewport data-testid="viewport">
      <Drawer.Popup data-testid="popup">
        {#if variant === 'textarea'}
          <textarea data-testid="textarea">Selectable text</textarea>
        {:else if variant === 'contenteditable'}
          <div contenteditable="true" data-testid="editable">Selectable text</div>
        {:else if variant === 'text'}
          <span data-testid="text">Selectable text</span>
        {:else}
          <input data-testid="input" value="Selectable text" />
        {/if}
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
