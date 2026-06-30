<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Select } from '$lib/components/select'

  let swapped = $state(false)
</script>

<Field.Root data-testid="root">
  {#if swapped}
    <Field.Control data-testid="control" value="x" />
  {:else}
    <Select.Root value={null}>
      <Select.Trigger>trigger</Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.Item value="a">a</Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  {/if}
</Field.Root>
<button type="button" onclick={() => (swapped = true)}>swap</button>
