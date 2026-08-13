# Menubar

A row of application menus.

:demo{name="menubar/hero"}

## Anatomy

One `<Menu.Root>` per top-level menu:

```svelte title="Anatomy"
<script>
  import { Menubar } from '@shardsui/svelte/menubar'
  import { Menu } from '@shardsui/svelte/menu'
</script>

<Menubar>
  <Menu.Root>
    <Menu.Trigger />
    <Menu.Portal>
      <Menu.Backdrop />
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Arrow />
          <Menu.Item />
          <Menu.LinkItem />
          <Menu.Separator />

          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger />
          </Menu.SubmenuRoot>

          <Menu.Group>
            <Menu.GroupLabel />
          </Menu.Group>

          <Menu.RadioGroup>
            <Menu.RadioItem>
              <Menu.RadioItemIndicator />
            </Menu.RadioItem>
          </Menu.RadioGroup>

          <Menu.CheckboxItem>
            <Menu.CheckboxItemIndicator />
          </Menu.CheckboxItem>

          <Menu.Viewport />
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>
```

Each menu is a full [Menu](/svelte/menu) — its parts (`Trigger`, `Positioner`, `Popup`, `Item`, `Group`, `RadioGroup`, `CheckboxItem`, `Viewport`, etc.) share the same props and data attributes documented there.

## API reference

::table{columns="Prop,Type,Default"}

| Prop          | Type                                                | Default        | Description                                                    |
| :------------ | :-------------------------------------------------- | :------------- | :------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`                       | `'div'`        | HTML element to render.                                        |
| `class`       | `string`                                            | —              | CSS class applied to the element.                              |
| `style`       | `string`                                            | —              | Inline style applied to the element.                           |
| `id`          | `string`                                            | auto           | Custom element ID.                                             |
| `modal`       | `boolean`                                           | `true`         | Whether the menubar is modal.                                  |
| `disabled`    | `boolean`                                           | `false`        | Whether the menubar is disabled. Cascades to all of its menus. |
| `orientation` | `'horizontal' \| 'vertical'`                        | `'horizontal'` | The orientation of the menubar.                                |
| `loopFocus`   | `boolean`                                           | `true`         | Whether focus loops back around.                               |
| `children`    | `Snippet<[{ orientation, modal, hasSubmenuOpen }]>` | —              | Menubar content; receives the menubar's state.                 |

::

| Attribute               | Description                                          |
| :---------------------- | :--------------------------------------------------- |
| `data-modal`            | Present when `modal` is true.                        |
| `data-orientation`      | Indicates the orientation of the menubar.            |
| `data-has-submenu-open` | Present when any submenu within the menubar is open. |
