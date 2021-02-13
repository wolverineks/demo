import React from 'react'
import { Image } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { useInfo } from '../hooks'

export const Logo: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const account = useEdgeAccount()
  const info = useInfo(account, currencyCode)

  return <Image src={info.symbolImage || '../../unknown-currency.png'} style={{ height: 80, width: 80 }} />
}
