import { Progress } from '$lib/components/progress'
import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicProgress from './fixtures/basic-progress.svelte'

describe('<Progress.Label />', () => {
  it('updates and clears the progress bar label association', async () => {
    const { rerender } = render(BasicProgress, {
      value: 40,
      labelText: 'Upload progress',
      labelId: 'label-a'
    })

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-labelledby', 'label-a')

    await rerender({ labelId: 'label-b' })
    expect(progressbar).toHaveAttribute('aria-labelledby', 'label-b')

    await rerender({ labelText: undefined })
    expect(progressbar).not.toHaveAttribute('aria-labelledby')
  })

  it('throws a descriptive error when rendered outside Progress.Root', () => {
    expect(() => render(Progress.Label)).toThrow(
      'ShardsUI: this part must be rendered inside <Progress.Root>.'
    )
  })
})
