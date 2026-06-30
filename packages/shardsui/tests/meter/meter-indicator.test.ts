import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicMeter from './fixtures/basic-meter.svelte'

describe('<Meter.Indicator />', () => {
  it('renders a custom as element', () => {
    render(BasicMeter, { indicatorAs: 'span' })
    expect(screen.getByTestId('indicator').tagName.toLowerCase()).toBe('span')
  })

  describe('value bounds', () => {
    it('clamps the width to 100% when the value exceeds max', () => {
      render(BasicMeter, { value: 150 })
      expect(screen.getByTestId('indicator').style.width).toBe('100%')
    })

    it('clamps the width to 0% when the value is below min', () => {
      render(BasicMeter, { value: -10 })
      expect(screen.getByTestId('indicator').style.width).toBe('0%')
    })

    it('produces a finite width when min equals max', () => {
      render(BasicMeter, { value: 5, min: 5, max: 5 })
      expect(screen.getByTestId('indicator').style.width).toBe('0%')
    })
  })

  describe.skipIf(isJSDOM)('internal styles', () => {
    it('sets positioning styles', () => {
      render(BasicMeter, { value: 33, rootStyle: 'width:100px' })

      const computed = getComputedStyle(screen.getByTestId('indicator'))
      expect(computed.left).toBe('0px')
      expect(computed.width).toBe('33px')
    })

    it('sets zero width when value is 0', () => {
      render(BasicMeter, { value: 0, rootStyle: 'width:100px' })

      const computed = getComputedStyle(screen.getByTestId('indicator'))
      expect(computed.insetInlineStart).toBe('0px')
      expect(computed.width).toBe('0px')
    })
  })
})
