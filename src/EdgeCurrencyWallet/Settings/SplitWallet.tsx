import { EdgeAccount, EdgeCurrencyWallet } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../../auth'
import { Button, Form, FormGroup } from '../../components'
import { useSplitWallet } from '../../hooks'

export const SplitWallet: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const account = useEdgeAccount()
  const { walletTypes, splitWallet } = useSplitWallet(account, wallet.id)

  if (walletTypes.length === 0) return null

  return (
    <FormGroup>
      <Form.Label>Split Wallet</Form.Label>
      {walletTypes.map((walletType) => {
        const currencyInfo = getCurrencyInfoFromWalletType(account, walletType)
        if (!currencyInfo) return null

        return (
          <Button key={walletType} onClick={() => splitWallet(walletType)}>
            Split to {currencyInfo.displayName}
          </Button>
        )
      })}
    </FormGroup>
  )
}

const getCurrencyInfoFromWalletType = (account: EdgeAccount, walletType: string) => {
  const currencyConfig = Object.values(account.currencyConfig).find(
    ({ currencyInfo }) => currencyInfo.walletType === walletType,
  )

  return currencyConfig?.currencyInfo
}
