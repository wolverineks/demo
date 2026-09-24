import React from 'react'

import { getFiatInfo } from '../hooks'
import { UNKNOWN_CURRENCY_ICON } from '../utils'

export const FiatLogo: React.FC<{ fiatCurrencyCode: string }> = ({ fiatCurrencyCode }) => {
  const fiatInfo = getFiatInfo(fiatCurrencyCode)
  const [failed, setFailed] = React.useState(false)
  const src = !failed && fiatInfo ? fiatInfo.symbolImage : UNKNOWN_CURRENCY_ICON

  React.useEffect(() => {
    setFailed(false)
  }, [fiatCurrencyCode])

  return (
    <img
      alt={fiatInfo?.currencyCode ?? fiatCurrencyCode}
      src={src}
      className="currency-logo"
      onError={() => setFailed(true)}
    />
  )
}
