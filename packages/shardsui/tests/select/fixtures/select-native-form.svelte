<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    multiple = false,
    disabled = false,
    value = undefined,
    onSubmit = undefined
  }: {
    multiple?: boolean
    disabled?: boolean
    value?: string | string[] | null
    onSubmit?: (data: FormData) => void
  } = $props()

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    onSubmit?.(new FormData(event.currentTarget as HTMLFormElement))
  }
</script>

<form {onsubmit}>
  <Select.Root {multiple} {disabled} {value} name="select">
    <Select.Trigger data-testid="trigger">
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          <Select.Item value="a">a</Select.Item>
          <Select.Item value="b">b</Select.Item>
          <Select.Item value="c">c</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
  <button type="submit">Submit</button>
</form>
