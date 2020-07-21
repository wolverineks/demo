import React from 'react'
import { Image } from 'react-bootstrap'

import { useAccount } from '../auth'
import { getLogo } from '../utils'

export const Logo: React.FC<{ walletType: string }> = ({ walletType }) => {
  const logo = getLogo({ account: useAccount(), walletType })

  return <Image src={logo} />
}
