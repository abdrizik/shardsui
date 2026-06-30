<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  import { Select } from '$lib/components/select'
  import { Slider } from '$lib/components/slider'
  import { Switch } from '$lib/components/switch'

  let { validateSpy }: { validateSpy: (value: unknown, formValues: unknown) => null } = $props()
</script>

<Form>
  <Field.Root name="checkbox">
    <Checkbox.Root checked={true} />
  </Field.Root>

  <Field.Root name="checkbox-group">
    <CheckboxGroup value={['apple', 'banana']}>
      <Field.Item>
        <Checkbox.Root value="apple" />
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="banana" />
      </Field.Item>
    </CheckboxGroup>
  </Field.Root>

  <Field.Root name="input" validate={validateSpy}>
    <Field.Control data-testid="input" type="url" value="https://example.com" />
  </Field.Root>

  <Field.Root name="radio-group">
    <RadioGroup value="cats">
      <Radio.Root value="cats" />
    </RadioGroup>
  </Field.Root>

  <Field.Root name="select">
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
  </Field.Root>

  <Field.Root name="slider">
    <Slider.Root value={12}>
      <Slider.Control />
    </Slider.Root>
  </Field.Root>

  <Field.Root name="range-slider">
    <Slider.Root value={[25, 70]}>
      <Slider.Control />
    </Slider.Root>
  </Field.Root>

  <Field.Root name="switch">
    <Switch.Root checked={false} />
  </Field.Root>

  <button type="submit">submit</button>
</Form>
