import React from 'react'
import { Image } from 'react-bootstrap'

import { useAccount } from '../auth'
import { getLogo } from '../utils'

export const Logo: React.FC<{ currencyCode: string }> = ({ currencyCode }) => {
  const logo = getLogo(useAccount(), currencyCode)

  return <Image src={logo} />
}
