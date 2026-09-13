import React from 'react'

import { useEdgeAccount } from '../auth'
import { Image } from '../components'
import { useInfo } from '../hooks'

export const Logo: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const account = useEdgeAccount()
  const info = useInfo(account, currencyCode)

  return <Image alt="" src={info.symbolImage || '/unknown-currency.png'} className="currency-logo" />
}
