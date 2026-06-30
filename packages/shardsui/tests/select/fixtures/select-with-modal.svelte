<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    modal = true
  }: {
    modal?: boolean
  } = $props()
</script>

<div>
  <Select.Root {modal}>
    <Select.Trigger data-testid="trigger">Open</Select.Trigger>
    <Select.Portal>
      <Select.Positioner data-testid="positioner">
        <Select.Popup>
          <Select.Item value="1">1</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
  <button>Outside</button>
</div>
