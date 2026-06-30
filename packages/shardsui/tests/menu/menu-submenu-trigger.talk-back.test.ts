import { fireEvent, render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import SingleSubmenuHoverMenu from './fixtures/single-submenu-hover-menu.svelte'

// `vi.mock` is hoisted per test file, so Android's platform needs a file of its own.
vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return { ...actual, isAndroid: true }
})

// TalkBack in Chrome activates elements with a synthetic mouse press: a zero-pressure 1x1
// `pointerdown` followed by `mousedown` and a `detail: 0` click.
function fireTalkBackMouseDown(element: Element) {
  fireEvent.pointerDown(element, {
    pointerType: 'mouse',
    width: 1,
    height: 1,
    pressure: 0,
    detail: 0
  })
  fireEvent.mouseDown(element, { detail: 0 })
}

function fireTalkBackPress(element: Element) {
  fireTalkBackMouseDown(element)
  fireEvent.click(element, { detail: 0 })
}

async function waitForFrames(count = 2) {
  for (let i = 0; i < count; i += 1) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })
  }
}

describe.skipIf(isJSDOM)('<Menu.SubmenuTrigger /> with TalkBack', () => {
  it('opens the submenu on a TalkBack press with the default openOnHover', async () => {
    const user = userEvent.setup()
    render(SingleSubmenuHoverMenu)

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const submenuTrigger = await screen.findByTestId('submenu-trigger')

    fireTalkBackPress(submenuTrigger)

    await screen.findByTestId('submenu')
  })

  it('keeps the submenu open on a TalkBack press with openOnHover={false}', async () => {
    const user = userEvent.setup()
    render(SingleSubmenuHoverMenu, { openOnHover: false })

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const submenuTrigger = await screen.findByTestId('submenu-trigger')

    fireTalkBackMouseDown(submenuTrigger)

    await screen.findByTestId('submenu')

    fireEvent.click(submenuTrigger, { detail: 0 })
    await waitForFrames()

    expect(screen.queryByTestId('submenu')).not.toBe(null)
  })

  it('ignores an ordinary mouse press with the default openOnHover', async () => {
    const user = userEvent.setup()
    render(SingleSubmenuHoverMenu)

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const submenuTrigger = await screen.findByTestId('submenu-trigger')

    fireEvent.pointerDown(submenuTrigger, {
      pointerType: 'mouse',
      width: 1,
      height: 1,
      pressure: 0.5,
      detail: 0
    })
    fireEvent.mouseDown(submenuTrigger)
    fireEvent.click(submenuTrigger, { detail: 1 })

    await waitForFrames()

    expect(screen.queryByTestId('submenu')).toBe(null)
  })
})
