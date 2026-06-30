import { ScrollArea } from '$lib/components/scroll-area'
import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicScrollArea from './fixtures/basic-scroll-area.svelte'
import ContentResize from './fixtures/content-resize.svelte'

describe('<ScrollArea.Content />', () => {
  it('renders a custom as element', () => {
    render(BasicScrollArea, { contentAs: 'section' })
    expect(screen.getByTestId('content').tagName.toLowerCase()).toBe('section')
  })

  it('throws when rendered outside a ScrollArea.Root', () => {
    expect(() => render(ScrollArea.Content)).toThrow(
      'ShardsUI: this part must be rendered inside <ScrollArea.Root>.'
    )
  })

  it.skipIf(isJSDOM)('recomputes overflow when observed content resizes', async () => {
    const user = userEvent.setup()
    render(ContentResize)

    const root = screen.getByTestId('root')

    await waitFor(() => expect(root).not.toHaveAttribute('data-has-overflow-y'))

    await user.click(screen.getByRole('button', { name: 'grow' }))

    await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-y'))
  })
})
