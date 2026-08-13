# Radio

One choice from a set of options.

:demo{name="radio/hero"}

## Anatomy

A Radio only works inside a Radio Group. Import both and nest the radios inside the group:

```svelte title="Anatomy"
<script>
  import { Radio } from '@shardsui/svelte/radio'
  import { RadioGroup } from '@shardsui/svelte/radio-group'
</script>

<RadioGroup>
  <Radio.Root value="...">
    <Radio.Indicator />
  </Radio.Root>
</RadioGroup>
```

## Usage guidelines

- **Form controls must have an accessible name**: name the group and each radio with `<label>` elements, or with the `Field` and `Fieldset` components. See [Labeling a radio group](#examples-labeling-a-radio-group).

## Examples

### Labeling a radio group

Point the group at a sibling label with `aria-labelledby`:

```svelte title="Using aria-labelledby to label a radio group"
<div id="storage-type-label">Storage type</div>
<RadioGroup aria-labelledby="storage-type-label">
  <!-- radios -->
</RadioGroup>
```

For each radio, an enclosing `<label>` takes the least markup. `Radio.Root` renders a `<span>` by default, so the label toggles the hidden `<input type="radio">` natively:

```svelte title="Using an enclosing label to label a radio button"
<!-- [!code highlight] -->
<label>
  <Radio.Root value="ssd">
    <Radio.Indicator />
  </Radio.Root>
  SSD
  <!-- [!code highlight] -->
</label>
```

### Rendering as a native button

When each radio has its own label tied to it with `for`/`id`, render it as a native button with `as="button"`. The `id` then lands on the button rather than the hidden input, so the label points at the focusable element:

```svelte title="Sibling label pattern with a native button"
<!-- [!code word:as="button"] -->
<div id="storage-type">Storage type</div>
<RadioGroup value="ssd" aria-labelledby="storage-type">
  <div>
    <label for="storage-type-ssd">SSD</label>
    <Radio.Root value="ssd" id="storage-type-ssd" as="button">
      <Radio.Indicator />
    </Radio.Root>
  </div>
</RadioGroup>
```

### Form integration

`Field.Root` names the group and wires it into the form; `Fieldset.Legend` labels it. Give each radio its own `Field.Item`, which scopes the enclosed `Field.Label` to that radio alone:

```svelte title="Using Radio Group in a form"
<Form>
  <!-- [!code highlight] -->
  <Field.Root name="storageType">
    <Fieldset.Root>
      <Fieldset.Legend>Storage type</Fieldset.Legend>
      <RadioGroup>
        <Field.Item>
          <Field.Label>
            <Radio.Root value="ssd"><Radio.Indicator /></Radio.Root>
            SSD
          </Field.Label>
        </Field.Item>
        <Field.Item>
          <Field.Label>
            <Radio.Root value="hdd"><Radio.Indicator /></Radio.Root>
            HDD
          </Field.Label>
        </Field.Item>
      </RadioGroup>
    </Fieldset.Root>
  </Field.Root>
</Form>
```

## API reference

### RadioGroup

Provides a shared state to a series of radio buttons.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop               | Type                                                                                  | Default | Description                                                                                          |
| :----------------- | :------------------------------------------------------------------------------------ | :------ | :--------------------------------------------------------------------------------------------------- |
| `as`               | `keyof HTMLElementTagNameMap`                                                         | `'div'` | HTML element to render.                                                                              |
| `class`            | `string`                                                                              | —       | CSS class applied to the element.                                                                    |
| `style`            | `string`                                                                              | —       | Inline style applied to the element.                                                                 |
| `value`            | `Value`                                                                               | —       | The selected radio value. Pass an initial value for uncontrolled use, or `bind:value` to control it. |
| `disabled`         | `boolean`                                                                             | `false` | Disables every radio in the group. Also on when an enclosing `Field.Root` is disabled.               |
| `readOnly`         | `boolean`                                                                             | `false` | Keeps the radios focusable but prevents the selection from changing.                                 |
| `required`         | `boolean`                                                                             | `false` | Requires a selection before the form can submit.                                                     |
| `name`             | `string`                                                                              | —       | Form-submission key shared with all child radios. An enclosing `Field.Root`'s `name` wins.           |
| `form`             | `string`                                                                              | —       | `id` of the form the hidden inputs belong to, when rendered outside it.                              |
| `aria-labelledby`  | `string`                                                                              | —       | Accessible name for the group. Falls back to an enclosing `Field.Label` or `Fieldset.Legend`.        |
| `aria-describedby` | `string`                                                                              | —       | Additional description IDs; merged with Field message IDs when wrapped in `Field.Root`.              |
| `id`               | `string`                                                                              | —       | Custom element ID.                                                                                   |
| `onValueChange`    | `(value: Value) => void`                                                              | —       | Fires when the selected value changes.                                                               |
| `children`         | `Snippet<[{ touched, dirty, filled, focused, valid, disabled, readOnly, required }]>` | —       | Content; receives the group's state and the enclosing field's state.                                 |

::

| Attribute       | Description                                                             |
| :-------------- | :---------------------------------------------------------------------- |
| `data-disabled` | Present when the group is disabled.                                     |
| `data-readonly` | Present when the group is read-only.                                    |
| `data-required` | Present when the group is required.                                     |
| `data-valid`    | Present when the field is valid (when wrapped in `Field.Root`).         |
| `data-invalid`  | Present when the field is invalid (when wrapped in `Field.Root`).       |
| `data-touched`  | Present when the field has been touched (when wrapped in `Field.Root`). |
| `data-dirty`    | Present when the value has changed (when wrapped in `Field.Root`).      |
| `data-filled`   | Present when the group has a selection (when wrapped in `Field.Root`).  |
| `data-focused`  | Present when focus is inside the group (when wrapped in `Field.Root`).  |

### Root

Represents the radio button itself.
Renders a `<span>` element and a hidden `<input>` beside.

::table{columns="Prop,Type,Default"}

| Prop               | Type                                                                                           | Default  | Description                                                                             |
| :----------------- | :--------------------------------------------------------------------------------------------- | :------- | :-------------------------------------------------------------------------------------- |
| `as`               | `'span' \| 'button'`                                                                           | `'span'` | HTML element to render.                                                                 |
| `class`            | `string`                                                                                       | —        | CSS class applied to the element.                                                       |
| `style`            | `string`                                                                                       | —        | Inline style applied to the element.                                                    |
| `id`               | `string`                                                                                       | auto     | Applied to the hidden `<input>` — or to the element itself when `as="button"`.          |
| `value`            | `unknown`                                                                                      | —        | Required. Identifies this radio within the group.                                       |
| `disabled`         | `boolean`                                                                                      | `false`  | Disables interaction. Also on when the group, `Field.Root` or `Field.Item` is disabled. |
| `readOnly`         | `boolean`                                                                                      | `false`  | Prevents selection. Also on when the group is read-only.                                |
| `required`         | `boolean`                                                                                      | `false`  | Marks the hidden input required. Also on when the group is required.                    |
| `aria-labelledby`  | `string`                                                                                       | —        | Accessible name. Falls back to an enclosing or associated `<label>`.                    |
| `aria-describedby` | `string`                                                                                       | —        | Additional description IDs; merged with Field message IDs when wrapped in `Field.Root`. |
| `children`         | `Snippet<[{ touched, dirty, filled, focused, valid, checked, disabled, readOnly, required }]>` | —        | Content; receives the radio's state and the enclosing field's state.                    |

::

| Attribute        | Description                                                             |
| :--------------- | :---------------------------------------------------------------------- |
| `data-checked`   | Present when selected.                                                  |
| `data-unchecked` | Present when not selected.                                              |
| `data-disabled`  | Present when disabled.                                                  |
| `data-readonly`  | Present when read-only.                                                 |
| `data-required`  | Present when required.                                                  |
| `data-valid`     | Present when the field is valid (when wrapped in `Field.Root`).         |
| `data-invalid`   | Present when the field is invalid (when wrapped in `Field.Root`).       |
| `data-touched`   | Present when the field has been touched (when wrapped in `Field.Root`). |
| `data-dirty`     | Present when the value has changed (when wrapped in `Field.Root`).      |
| `data-filled`    | Present when the group has a selection (when wrapped in `Field.Root`).  |
| `data-focused`   | Present when focus is inside the group (when wrapped in `Field.Root`).  |

### Indicator

Indicates whether the radio button is selected.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                                                                                             | Default  | Description                                                                  |
| :------------ | :--------------------------------------------------------------------------------------------------------------- | :------- | :--------------------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`                                                                                    | `'span'` | HTML element to render.                                                      |
| `class`       | `string`                                                                                                         | —        | CSS class applied to the element.                                            |
| `style`       | `string`                                                                                                         | —        | Inline style applied to the element.                                         |
| `keepMounted` | `boolean`                                                                                                        | `false`  | Keep in DOM when unchecked (for exit animations).                            |
| `children`    | `Snippet<[{ touched, dirty, filled, focused, valid, checked, disabled, readOnly, required, transitionStatus }]>` | —        | Content; receives the radio's state plus the indicator's `transitionStatus`. |

::

Inherits the same data attributes as Root, plus:

| Attribute             | Description                                  |
| :-------------------- | :------------------------------------------- |
| `data-starting-style` | Present when the indicator is animating in.  |
| `data-ending-style`   | Present when the indicator is animating out. |
