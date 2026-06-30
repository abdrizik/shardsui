import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isGecko, isJSDOM } from '../test-utils'
import ClientErrorArray from './fixtures/client-error-array.svelte'
import ConstructorName from './fixtures/constructor-name.svelte'
import EmptyErrorId from './fixtures/empty-error-id.svelte'
import ErrorAnimEnter from './fixtures/error-anim-enter.svelte'
import ErrorAnim from './fixtures/error-anim.svelte'
import ErrorArray from './fixtures/error-array.svelte'
import ErrorControlName from './fixtures/error-control-name.svelte'
import FieldErrorClientPath from './fixtures/field-error-client-path.svelte'
import FieldErrorCustom from './fixtures/field-error-custom.svelte'
import FieldErrorImplicit from './fixtures/field-error-implicit.svelte'
import FieldErrorMatchTrue from './fixtures/field-error-match-true.svelte'
import FieldErrorMatch from './fixtures/field-error-match.svelte'
import FieldErrorOmittedMatch from './fixtures/field-error-omitted-match.svelte'
import MatchFalseClient from './fixtures/match-false-client.svelte'
import MatchFalseField from './fixtures/match-false-field.svelte'

describe('<Field.Error />', () => {
  it('does not register an empty error id', () => {
    render(EmptyErrorId)

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'external-description')
  })

  it('sets aria-describedby on the control automatically', () => {
    render(FieldErrorMatchTrue)

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      screen.getByText('Message').id
    )
  })

  it('shows error messages by default', async () => {
    render(FieldErrorImplicit)

    expect(screen.queryByText('Message')).not.toBeInTheDocument()

    const input = screen.getByRole('textbox')

    await fireEvent.focus(input)
    await fireEvent.input(input, { target: { value: 'a' } })
    await fireEvent.input(input, { target: { value: '' } })
    await fireEvent.blur(input)
    expect(screen.queryByText('Message')).not.toBeInTheDocument()

    await fireEvent.click(screen.getByText('submit'))
    expect(screen.queryByText('Message')).toBeInTheDocument()
  })

  describe('prop: match', () => {
    it('only renders when `match` matches constraint validation', async () => {
      render(FieldErrorMatch)

      expect(screen.queryByText('Message')).not.toBeInTheDocument()

      await fireEvent.click(screen.getByText('submit'))
      expect(screen.queryByText('Message')).toBeInTheDocument()

      const input = screen.getByRole('textbox')

      await fireEvent.focus(input)
      await fireEvent.input(input, { target: { value: 'a' } })
      expect(screen.queryByText('Message')).not.toBeInTheDocument()

      await fireEvent.input(input, { target: { value: '' } })
      expect(screen.queryByText('Message')).toBeInTheDocument()
    })

    it('shows custom errors', async () => {
      render(FieldErrorCustom)

      const input = screen.getByRole('textbox')

      await fireEvent.focus(input)
      await fireEvent.input(input, { target: { value: 'a' } })
      await fireEvent.blur(input)
      expect(screen.queryByText('Message')).not.toBeInTheDocument()

      await fireEvent.click(screen.getByText('submit'))
      expect(screen.queryByText('Message')).toBeInTheDocument()
    })

    it('uses `match={false}` as the default slot for Form errors', () => {
      render(MatchFalseField, { formError: 'Username is reserved' })

      expect(screen.queryByTestId('value-missing-error')).not.toBeInTheDocument()
      expect(screen.getByTestId('default-error')).toHaveTextContent('Username is reserved')
    })

    it('uses an omitted `match` as the default slot for Form errors', () => {
      render(FieldErrorOmittedMatch)

      expect(screen.queryByText('Username is required.')).not.toBeInTheDocument()
      expect(screen.queryByText('Username must be at least 8 characters.')).not.toBeInTheDocument()
      expect(
        screen.queryByText('Username can only include lowercase letters.')
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('default-error')).toHaveTextContent('Username is reserved')
    })

    it('uses the Field.Control name fallback for Form errors', async () => {
      render(ErrorControlName)
      const control = screen.getByRole('textbox')

      expect(control).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('default-error')).toHaveTextContent('Email is already taken')

      await fireEvent.input(control, { target: { value: 'next@example.com' } })

      await waitFor(() => expect(control).not.toHaveAttribute('aria-invalid'))
      expect(screen.queryByTestId('default-error')).not.toBeInTheDocument()
    })

    it('ignores inherited Form error properties', () => {
      render(ConstructorName)

      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByTestId('default-error')).not.toBeInTheDocument()
    })

    it('renders Form error arrays as a list', () => {
      render(ErrorArray, {
        errors: { username: ['Username is reserved', 'Username is too short'] }
      })

      const defaultError = screen.getByTestId('default-error')
      const list = defaultError.querySelector('ul')
      expect(list).not.toBe(null)
      expect(list?.querySelectorAll('li')).toHaveLength(2)
      expect(within(defaultError).getByText('Username is reserved')).toBeInTheDocument()
      expect(within(defaultError).getByText('Username is too short')).toBeInTheDocument()
    })

    it('renders client validation error arrays as a list', async () => {
      render(ClientErrorArray)

      await fireEvent.click(screen.getByText('submit'))

      const defaultError = screen.getByTestId('default-error')
      const list = defaultError.querySelector('ul')
      expect(list).not.toBe(null)
      expect(list?.querySelectorAll('li')).toHaveLength(2)
      expect(within(defaultError).getByText('First error')).toBeInTheDocument()
      expect(within(defaultError).getByText('Second error')).toBeInTheDocument()
    })

    it('renders single-item Form error arrays as text', () => {
      render(ErrorArray, { errors: { username: ['Username is reserved'] } })

      expect(screen.getByTestId('default-error').querySelector('ul')).toBe(null)
      expect(screen.getByTestId('default-error')).toHaveTextContent('Username is reserved')
    })

    it('ignores empty Form error arrays', () => {
      render(ErrorArray, { errors: { username: [] } })

      expect(screen.queryByTestId('default-error')).not.toBeInTheDocument()
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
    })

    it('uses `match={false}` as the default slot for client validation errors', async () => {
      render(MatchFalseClient)

      expect(screen.queryByTestId('default-error')).not.toBeInTheDocument()

      await fireEvent.click(screen.getByText('submit'))

      await waitFor(() => expect(screen.getByTestId('default-error')).toBeInTheDocument())
    })

    it('uses the client validation path for specific matches when Form errors are present', async () => {
      render(FieldErrorClientPath)

      await fireEvent.click(screen.getByText('submit'))

      expect(screen.getByTestId('custom-error')).toHaveTextContent('Client validation error')
      expect(screen.getByTestId('custom-error')).not.toHaveTextContent('Username is reserved')
      expect(screen.getByTestId('default-error')).toHaveTextContent('Username is reserved')
    })

    it('always renders the error message when `match` is true', () => {
      render(FieldErrorMatchTrue)
      expect(screen.queryByText('Message')).toBeInTheDocument()
    })
  })

  describe.skipIf(isJSDOM)('animations', () => {
    let previousAnimationsDisabled: boolean

    beforeEach(() => {
      previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    })

    afterEach(() => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      cleanup()
    })

    it.skipIf(isGecko)(
      'triggers enter animation via data-starting-style when mounting',
      async () => {
        const user = userEvent.setup()
        let transitionFinished = false
        render(ErrorAnimEnter, {
          onTransitionFinished: () => {
            transitionFinished = true
          }
        })

        expect(screen.queryByTestId('error')).not.toBeInTheDocument()

        await user.click(screen.getByText('Show'))

        await waitFor(() => expect(transitionFinished).toBe(true))

        expect(screen.getByTestId('error')).toBeInTheDocument()
      }
    )

    it('applies data-ending-style before unmount', async () => {
      const user = userEvent.setup()
      render(ErrorAnim)

      expect(screen.getByTestId('error')).toBeInTheDocument()

      await user.click(screen.getByText('Hide'))

      await waitFor(() => {
        const error = screen.queryByTestId('error')
        expect(error).not.toBeNull()
        expect(error).toHaveAttribute('data-ending-style')
      })

      await waitFor(() => expect(screen.queryByTestId('error')).not.toBeInTheDocument())
    })
  })
})
