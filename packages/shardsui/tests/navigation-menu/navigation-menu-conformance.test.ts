import { NavigationMenu } from '$lib/components/navigation-menu'
import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import ConfigurableNavigationMenu from './fixtures/configurable-navigation-menu.svelte'
import MissingOwner from './fixtures/missing-owner.svelte'

const parts = [
  { name: 'root', prop: 'rootAs', customTag: 'section' },
  { name: 'list', prop: 'listAs', customTag: 'menu' },
  { name: 'item', prop: 'itemAs', customTag: 'div' },
  { name: 'trigger', prop: 'triggerAs', customTag: 'a' },
  { name: 'icon', prop: 'iconAs', customTag: 'i' },
  { name: 'link', prop: 'linkAs', customTag: 'span' },
  { name: 'backdrop', prop: 'backdropAs', customTag: 'span' },
  { name: 'positioner', prop: 'positionerAs', customTag: 'section' },
  { name: 'popup', prop: 'popupAs', customTag: 'section' },
  { name: 'arrow', prop: 'arrowAs', customTag: 'span' },
  { name: 'viewport', prop: 'viewportAs', customTag: 'section' }
] as const

describe('<NavigationMenu /> conformance', () => {
  it.each(parts)('$name renders the tag from `as`', ({ name, prop, customTag }) => {
    render(ConfigurableNavigationMenu, { [prop]: customTag })
    expect(screen.getByTestId(name).tagName.toLowerCase()).toBe(customTag)
  })

  it('List throws a descriptive error when rendered outside <NavigationMenu.Root>', () => {
    expect(() => render(NavigationMenu.List)).toThrow(
      'ShardsUI: this part must be rendered inside <NavigationMenu.Root>.'
    )
  })

  it('Icon throws a descriptive error when rendered outside <NavigationMenu.Item>', () => {
    expect(() => render(MissingOwner, { part: 'icon' })).toThrow(
      'ShardsUI: this part must be rendered inside <NavigationMenu.Item>.'
    )
  })

  it('Positioner throws a descriptive error when rendered outside <NavigationMenu.Portal>', () => {
    expect(() => render(MissingOwner, { part: 'positioner' })).toThrow(
      'ShardsUI: this part must be rendered inside <*.Portal>.'
    )
  })

  it('Arrow throws a descriptive error when rendered outside <NavigationMenu.Positioner>', () => {
    expect(() => render(MissingOwner, { part: 'arrow' })).toThrow(
      'ShardsUI: this part must be rendered inside <NavigationMenu.Positioner>.'
    )
  })
})
