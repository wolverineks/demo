import { EdgeCurrencyWallet } from 'edge-core-js'

export const getBalance = ({
  wallet,
  currencyCode,
}: {
  wallet: Pick<EdgeCurrencyWallet, 'balances'>
  currencyCode: string
}) => wallet.balances[currencyCode]
