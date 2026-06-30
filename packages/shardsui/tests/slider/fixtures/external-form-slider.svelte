<script lang="ts">
  import { Slider } from '$lib/components/slider'

  let {
    value = 25,
    onNativeSubmit
  }: {
    value?: number
    onNativeSubmit?: (data: FormData) => void
  } = $props()

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    onNativeSubmit?.(new FormData(event.currentTarget as HTMLFormElement))
  }
</script>

<form id="external-form" {onsubmit}>
  <button type="submit">Submit</button>
</form>

<Slider.Root {value} name="slider" form="external-form" data-testid="root">
  <Slider.Control data-testid="control">
    <Slider.Track>
      <Slider.Thumb data-testid="thumb" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
