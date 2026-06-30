<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Select } from '$lib/components/select'
  import { Slider } from '$lib/components/slider'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()
  let showSlider = $state(false)
</script>

<Form {onFormSubmit}>
  <Field.Root name="value">
    {#if showSlider}
      <Slider.Root value={12}>
        <Slider.Control />
      </Slider.Root>
    {:else}
      <Select.Root value="sans">
        <Select.Trigger>sans</Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              <Select.Item value="sans">sans</Select.Item>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    {/if}
  </Field.Root>
  <button type="button" onclick={() => (showSlider = true)}>Toggle</button>
  <button type="submit">submit</button>
</Form>
