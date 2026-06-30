import Button from '$lib/components/button/button.svelte'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'

function renderWithHandlers(props: Record<string, unknown> = {}) {
  const handlers = {
    onclick: vi.fn(),
    onmousedown: vi.fn(),
    onpointerdown: vi.fn(),
    onkeydown: vi.fn()
  }
  render(Button, { ...handlers, ...props })
  return { user: userEvent.setup(), button: screen.getByRole('button'), handlers }
}

async function expectNoInteractions(
  user: ReturnType<typeof userEvent.setup>,
  button: HTMLElement,
  handlers: Record<string, ReturnType<typeof vi.fn>>
) {
  await user.click(button)
  await user.keyboard('[Space]')
  await user.keyboard('[Enter]')

  for (const handler of Object.values(handlers)) {
    expect(handler).not.toHaveBeenCalled()
  }
}

describe('<Button />', () => {
  describe('prop: disabled', () => {
    it('native button: uses the disabled attribute and is not focusable', async () => {
      const { user, button, handlers } = renderWithHandlers({ disabled: true })

      expect(button).toHaveAttribute('disabled')
      expect(button).toHaveAttribute('data-disabled')
      expect(button).not.toHaveAttribute('aria-disabled')

      await user.keyboard('[Tab]')
      expect(button).not.toHaveFocus()

      await expectNoInteractions(user, button, handlers)
    })

    it('custom element: applies aria-disabled and is not focusable', async () => {
      const { user, button, handlers } = renderWithHandlers({
        disabled: true,
        as: 'span'
      })

      expect(button).not.toHaveAttribute('disabled')
      expect(button).toHaveAttribute('data-disabled')
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveAttribute('tabindex', '-1')

      await user.keyboard('[Tab]')
      expect(button).not.toHaveFocus()

      await expectNoInteractions(user, button, handlers)
    })
  })

  describe('prop: as', () => {
    it('renders the element named by the as prop', () => {
      render(Button, { as: 'span' })
      expect(screen.getByRole('button').tagName).toBe('SPAN')
    })
  })
})
