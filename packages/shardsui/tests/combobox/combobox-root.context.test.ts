import { render } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import InputOutsideRoot from './fixtures/input-outside-root.svelte'
import PositionerOutsidePortal from './fixtures/positioner-outside-portal.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('Combobox contexts', () => {
  it('throws a descriptive error when a part is rendered outside <Combobox.Root>', () => {
    expect(() => render(InputOutsideRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Combobox.Root>.'
    )
  })

  it('throws a descriptive error when the positioner is rendered outside <Combobox.Portal>', () => {
    expect(() => render(PositionerOutsidePortal)).toThrow(
      'ShardsUI: this part must be rendered inside <*.Portal>.'
    )
  })
})
