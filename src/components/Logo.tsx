import React from 'react'
import { Image } from 'react-bootstrap'

import { useEdgeAccount } from '../auth'
import { getLogo } from '../utils'

export const Logo: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const logo = getLogo(useEdgeAccount(), currencyCode)

  return <Image src={logo} style={{ height: 80, width: 80 }} />
}
