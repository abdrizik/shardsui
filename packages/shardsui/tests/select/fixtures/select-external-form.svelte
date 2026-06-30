<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    multiple = false,
    name = 'country',
    value = undefined,
    onSubmit = undefined
  }: {
    multiple?: boolean
    name?: string
    value?: string | string[] | null
    onSubmit?: (data: FormData) => void
  } = $props()

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    onSubmit?.(new FormData(event.currentTarget as HTMLFormElement))
  }
</script>

<form id="external-form" {onsubmit}>
  <button type="submit">Submit</button>
</form>

<Select.Root {multiple} {name} {value} form="external-form">
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="US">United States</Select.Item>
        <Select.Item value="CA">Canada</Select.Item>
        <Select.Item value="AU">Australia</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
