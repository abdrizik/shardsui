<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    open = $bindable(false),
    onOpenChangeComplete = undefined
  }: {
    open?: boolean
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()
</script>

<button onclick={() => (open = true)}>Open</button>
<button onclick={() => (open = false)}>Close</button>
<Select.Root bind:open {onOpenChangeComplete}>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup data-testid="popup" />
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
