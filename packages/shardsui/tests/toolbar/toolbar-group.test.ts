import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import ToolbarWithGroup from './fixtures/toolbar-with-group.svelte'

describe('<Toolbar.Group />', () => {
  it('renders an element with role=group', () => {
    render(ToolbarWithGroup)
    expect(screen.getByTestId('group')).toBe(screen.getByRole('group'))
  })

  it('disables all toolbar items except links in the group', () => {
    render(ToolbarWithGroup, { groupDisabled: true })
    ;[screen.getByRole('button'), screen.getByRole('textbox')].forEach((item) => {
      expect(item).toHaveAttribute('aria-disabled', 'true')
      expect(item).toHaveAttribute('data-disabled')
    })

    const link = screen.getByTestId('group-link')
    expect(link).not.toHaveAttribute('data-disabled')
    expect(link).not.toHaveAttribute('aria-disabled')
  })
})
