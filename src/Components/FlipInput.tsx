import React from 'react'

import { useAccount } from '../auth'
import { AmountInput, Boundary } from '../components'
import { useDisplayDenomination } from '../hooks'
import { denominatedToNative, getExchangeDenomination, nativeToDenominated } from '../utils'

export const FlipInput: React.FC<{
  onChange: (nativeAmount: string) => any
  currencyCode: string
  fiatCurrencyCode: string
}> = ({ currencyCode, fiatCurrencyCode, onChange }) => {
  const account = useAccount()

  const [direction, setDirection] = React.useState<'cryptoToFiat' | 'fiatToCrypto'>('cryptoToFiat')

  const [topDisplayAmount, setTopDisplayAmount] = React.useState('0')
  const [bottomDisplayAmount, setBottomDisplayAmoumt] = React.useState('0')

  const topDisplayDenomination = useDisplayDenomination(account, currencyCode)[0]
  const bottomDisplayDenomination = useDisplayDenomination(account, fiatCurrencyCode)[0]

  const topExchangeDenomination = getExchangeDenomination(account, currencyCode)
  const bottomExchangeDenomination = getExchangeDenomination(account, fiatCurrencyCode)

  React.useEffect(() => {
    const onTopChange = async (topDisplayAmount: string) => {
      const topNativeAmount = denominatedToNative({
        amount: topDisplayAmount,
        denomination: topDisplayDenomination,
      })
      const topExchangeAmount = nativeToDenominated({
        nativeAmount: topNativeAmount,
        denomination: topExchangeDenomination,
      })
      const bottomExchangeAmount = await account.rateCache.convertCurrency(
        currencyCode,
        fiatCurrencyCode,
        Number(topExchangeAmount),
      )
      const bottomNativeAmount = denominatedToNative({
        amount: String(bottomExchangeAmount),
        denomination: bottomExchangeDenomination,
      })
      const bottomDisplayAmount = nativeToDenominated({
        nativeAmount: bottomNativeAmount,
        denomination: bottomDisplayDenomination,
      })

      setTopDisplayAmount(topDisplayAmount)
      setBottomDisplayAmoumt(String(bottomDisplayAmount))

      onChange(topNativeAmount)
    }

    const onBottomChange = async (bottomDisplayAmount: string) => {
      const bottomNativeAmount = denominatedToNative({
        amount: bottomDisplayAmount,
        denomination: bottomDisplayDenomination,
      })
      const bottomExchangeAmount = nativeToDenominated({
        nativeAmount: bottomNativeAmount,
        denomination: bottomExchangeDenomination,
      })
      const topExchangeAmount = await account.rateCache.convertCurrency(
        fiatCurrencyCode,
        currencyCode,
        Number(bottomExchangeAmount),
      )
      const topNativeAmount = denominatedToNative({
        amount: String(topExchangeAmount),
        denomination: topExchangeDenomination,
      })
      const topDisplayAmount = nativeToDenominated({
        nativeAmount: topNativeAmount,
        denomination: topDisplayDenomination,
      })

      setBottomDisplayAmoumt(bottomDisplayAmount)
      setTopDisplayAmount(String(topDisplayAmount))
      onChange(topNativeAmount)
    }

    direction === 'cryptoToFiat' ? onTopChange(topDisplayAmount) : onBottomChange(bottomDisplayAmount)
  }, [
    account.rateCache,
    bottomDisplayAmount,
    bottomDisplayDenomination,
    bottomExchangeDenomination,
    currencyCode,
    direction,
    fiatCurrencyCode,
    onChange,
    topDisplayAmount,
    topDisplayDenomination,
    topExchangeDenomination,
  ])

  return (
    <div>
      <Boundary>
        <AmountInput
          amount={topDisplayAmount}
          onChange={(displayAmount) => {
            setDirection('cryptoToFiat')
            setTopDisplayAmount(displayAmount)
          }}
          denomination={topDisplayDenomination}
        />
      </Boundary>

      <Boundary>
        <AmountInput
          amount={bottomDisplayAmount}
          onChange={(displayAmount) => {
            setDirection('fiatToCrypto')
            setBottomDisplayAmoumt(displayAmount)
          }}
          denomination={bottomDisplayDenomination}
        />
      </Boundary>
    </div>
  )
}
