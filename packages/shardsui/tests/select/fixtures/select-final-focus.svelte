<script lang="ts">
  import { Select } from '$lib/components/select'

  type FinalFocusMode =
    | 'default'
    | 'ref'
    | 'function-ref'
    | 'false'
    | 'function-true'
    | 'function-null'

  let { mode = 'default' }: { mode?: FinalFocusMode } = $props()

  let inputToFocus = $state<HTMLInputElement | null>(null)

  const finalFocus = $derived.by(() => {
    switch (mode) {
      case 'ref':
        return inputToFocus
      case 'function-ref':
        return () => inputToFocus
      case 'false':
        return false
      case 'function-true':
        return () => true
      case 'function-null':
        return () => null
      default:
        return undefined
    }
  })
</script>

<div>
  <input />
  <Select.Root>
    <Select.Trigger data-testid="trigger">Open</Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup finalFocus={finalFocus as never}>
          <Select.Item value="1">Item 1</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
  <input />
  <input data-testid="input-to-focus" bind:this={inputToFocus} />
  <input />
</div>
