<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { variant = 'input' }: { variant?: 'input' | 'trigger' | 'popup-input' | 'none' } = $props()
</script>

{#if variant === 'input'}
  <Combobox.Root>
    <Combobox.Input data-testid="visible-input" />
  </Combobox.Root>
{:else if variant === 'trigger'}
  <Combobox.Root>
    <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  </Combobox.Root>
{:else if variant === 'popup-input'}
  <Combobox.Root open>
    <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup>
          <Combobox.Input data-testid="popup-input" />
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
{:else}
  <Combobox.Root />
{/if}
