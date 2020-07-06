import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Image } from 'react-bootstrap'

import { useAccount } from '../Auth'
import { getCurrencyInfoFromWalletType } from '../utils'

export const Logo: React.FC<{ walletType: string }> = ({ walletType }) => {
  const account = useAccount()
  const logo = getLogo({ account, walletType })

  return <Image src={logo} />
}

export const getLogo = ({ account, walletType }: { account: EdgeAccount; walletType: string }) =>
  getCurrencyInfoFromWalletType({ account, walletType }).symbolImage
