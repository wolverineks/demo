import { render, screen } from '@testing-library/react'
import React from 'react'

import { FiatLogo } from '../FiatLogo'

describe('FiatLogo', () => {
  it('uses the fiat flag for USD and iso:USD', () => {
    const { rerender } = render(<FiatLogo fiatCurrencyCode="USD" />)
    const img = screen.getByRole('img')

    expect(img).toHaveAttribute('alt', 'USD')
    expect(img.getAttribute('src')).toBe('https://flagcdn.com/24x18/us.png')

    rerender(<FiatLogo fiatCurrencyCode="iso:USD" />)

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'USD')
    expect(screen.getByRole('img').getAttribute('src')).toBe('https://flagcdn.com/24x18/us.png')
  })
})
