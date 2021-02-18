import { EdgeCurrencyWallet, EdgeMetaToken, EdgeTokenInfo } from 'edge-core-js'
import React from 'react'

import { useEdgeAccount } from '../auth'
import { CreateWallet } from '../EdgeAccount'
import { SelectedWalletInfo } from '../EdgeAccount/SelectedWalletInfo'
import { Settings } from '../EdgeAccount/Settings'
import { Exchange } from '../Exchange'
import { readCustomTokenInfos, readEnabledTokenCurrencyCodes, useActiveWalletIds } from '../hooks'
import { Route, useRoute } from '../route'
import { SelectedWalletBoundary, useSelectedWallet } from '../SelectedWallet'

export const Main = () => {
  const route = useRoute()
  const account = useEdgeAccount()
  const activeWalletIds = useActiveWalletIds(account)
  useBootstapWallets()

  return (
    <>
      {route === Route.account ? (
        <SelectedWalletBoundary fallback={<div>No Selected Wallet</div>}>
          <SelectedWalletInfo />
        </SelectedWalletBoundary>
      ) : route === Route.settings ? (
        <Settings />
      ) : route === Route.createWallet ? (
        <CreateWallet key={activeWalletIds.length} />
      ) : route === Route.exchange ? (
        <SelectedWalletBoundary>
          <ExchangeWithSelectedWallet />
        </SelectedWalletBoundary>
      ) : (
        <div>404</div>
      )}
    </>
  )
}

const ExchangeWithSelectedWallet = () => {
  const [{ wallet, currencyCode }] = useSelectedWallet()

  return <Exchange wallet={wallet} currencyCode={currencyCode} />
}

const useBootstapWallets = () => {
  const account = useEdgeAccount()

  React.useEffect(() => {
    account.activeWalletIds.map(async (id) => {
      const wallet = await account.waitForCurrencyWallet(id)
      enableTokens(wallet)
    })
  }, [account])
}

const enableTokens = async (wallet: EdgeCurrencyWallet) => {
  await wallet.disableTokens(await wallet.getEnabledTokens()) // HACK: all wallets should start with an empty list of enabled tokens

  const customTokenInfos = await readCustomTokenInfos(wallet)
  const enabledTokenCurrencyCodes = await readEnabledTokenCurrencyCodes(wallet)
  const enabledCustomTokens = Object.values(customTokenInfos).filter(isEnabled(enabledTokenCurrencyCodes)).map(toToken)

  await Promise.all(enabledCustomTokens.map(wallet.addCustomToken))
  wallet.enableTokens(enabledTokenCurrencyCodes)
}

const isEnabled = (enabledTokenCurrencyCodes: string[]) => ({ currencyCode }: EdgeMetaToken) =>
  !enabledTokenCurrencyCodes.includes(currencyCode)

const toToken = (token: EdgeMetaToken): EdgeTokenInfo => ({
  currencyCode: token.currencyCode,
  currencyName: token.currencyName,
  multiplier: token.denominations[0].multiplier,
  contractAddress: token.contractAddress!,
})
