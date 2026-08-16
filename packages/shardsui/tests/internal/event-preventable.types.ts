import type { ComponentProps } from 'svelte'
import { Button } from '$lib/components/button'
import { Field } from '$lib/components/field'
import { Menu } from '$lib/components/menu'
import { Toolbar } from '$lib/components/toolbar'

type ButtonProps = ComponentProps<typeof Button>
type FieldControlProps = ComponentProps<typeof Field.Control>
type MenuItemProps = ComponentProps<typeof Menu.Item>
type MenuTriggerProps = ComponentProps<typeof Menu.Trigger>
type ToolbarInputProps = ComponentProps<typeof Toolbar.Input>

export const onMenuItemClick: MenuItemProps['onclick'] = (event) => {
  event.preventShardsUIHandler()
}

export const onButtonKeyUp: ButtonProps['onkeyup'] = (event) => {
  event.preventShardsUIHandler()
}

export const onMenuTriggerMouseDown: MenuTriggerProps['onmousedown'] = (event) => {
  event.preventShardsUIHandler()
}

export const onFieldControlKeyDown: FieldControlProps['onkeydown'] = (event) => {
  event.preventShardsUIHandler()
}

export const onToolbarInputClick: ToolbarInputProps['onclick'] = (event) => {
  event.preventShardsUIHandler()
}

export const onMenuItemMouseDown: MenuItemProps['onmousedown'] = (event) => {
  // @ts-expect-error - nothing of Menu.Item's runs after onmousedown, so the method is absent
  event.preventShardsUIHandler()
}

export const onButtonClick: ButtonProps['onclick'] = (event) => {
  // @ts-expect-error - Button runs nothing after onclick, so the method is absent
  event.preventShardsUIHandler()
}

export const onFieldControlChange: FieldControlProps['onchange'] = (event) => {
  // @ts-expect-error - onchange is forwarded untouched, so the method is absent
  event.preventShardsUIHandler()
}
