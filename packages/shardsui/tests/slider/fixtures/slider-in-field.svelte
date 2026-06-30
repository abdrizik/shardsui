<script lang="ts">
  import { Slider } from '$lib/components/slider'
  import { Field } from '$lib/components/field'
  let {
    value = $bindable(50),
    disabled = false,
    name = undefined
  }: {
    value?: number
    disabled?: boolean
    name?: string
  } = $props()
</script>

<Field.Root {disabled} {name}>
  <Slider.Root bind:value data-testid="slider">
    <Slider.Control data-testid="control">
      <Slider.Track>
        <Slider.Thumb data-testid="thumb" />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
  <Field.Label data-testid="label">Volume</Field.Label>
  <Field.Description data-testid="description">Adjust the volume</Field.Description>
</Field.Root>
