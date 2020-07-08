import {
  EdgeAccount,
  EdgeCurrencyCodeOptions,
  EdgeCurrencyWallet,
  EdgeGetTransactionsOptions,
  EdgeSpendInfo,
} from 'edge-core-js'
import { useWatchAll } from 'edge-react-hooks'
import { useQuery } from 'react-query'

export const useReceiveAddressAndEncodeUri = ({
  wallet,
  nativeAmount,
  options,
}: {
  wallet: EdgeCurrencyWallet
  nativeAmount: string
  options?: EdgeCurrencyCodeOptions
}) =>
  useQuery({
    queryKey: ['receiveAddressAndEncodeUri', wallet.id, nativeAmount, options],
    queryFn: () => {
      const receiveAddress = wallet.getReceiveAddress({ currencyCode: options?.currencyCode })
      const encodeUri = receiveAddress.then(({ publicAddress }) =>
        wallet.encodeUri({
          publicAddress,
          nativeAmount: nativeAmount || '0',
        }),
      )

      return Promise.all([receiveAddress, encodeUri]).then(([receiveAddress, uri]) => ({ receiveAddress, uri }))
    },
    config: { staleTime: Infinity, cacheTime: 0, suspense: false },
  })

export const useEnabledTokens = ({ wallet }: { wallet: EdgeCurrencyWallet }) =>
  useQuery({
    queryKey: ['enabledTokens', wallet.id],
    queryFn: () => wallet.getEnabledTokens(),
    config: { suspense: true },
  }).data!

export const useWallet = ({ account, walletId }: { account: EdgeAccount; walletId: string }) => {
  const wallet = useQuery({
    queryKey: ['wallet', walletId],
    queryFn: () => account.waitForCurrencyWallet(walletId),
    config: { suspense: true },
  }).data!

  useWatchAll(wallet as any)

  return wallet
}

export const useTransactions = ({
  wallet,
  options,
}: {
  wallet: EdgeCurrencyWallet
  options: EdgeGetTransactionsOptions
}) =>
  useQuery({
    queryKey: ['transactions', wallet.id, options],
    queryFn: () => wallet.getTransactions(options),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0 },
  })

export const useTransactionCount = ({
  wallet,
  options,
}: {
  wallet: EdgeCurrencyWallet
  options: EdgeGetTransactionsOptions
}) =>
  useQuery({
    queryKey: ['transactionCount', wallet.id, options],
    queryFn: () => wallet.getNumTransactions(options),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0 },
  })

export const useMaxSpendable = ({ wallet, spendInfo }: { wallet: EdgeCurrencyWallet; spendInfo: EdgeSpendInfo }) =>
  useQuery({
    queryKey: ['maxSpendable', wallet.id, spendInfo],
    queryFn: () => wallet.getMaxSpendable(spendInfo),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0, useErrorBoundary: false, retry: 0 },
  })

export const useMaxTransaction = ({ wallet, spendInfo }: { wallet: EdgeCurrencyWallet; spendInfo: EdgeSpendInfo }) =>
  useQuery({
    queryKey: ['maxSpendableTransaction', wallet.id, spendInfo],
    queryFn: async () => {
      const maxSpendable = await wallet.getMaxSpendable(spendInfo)
      const spendTargets = [{ ...spendInfo.spendTargets[0], nativeAmount: maxSpendable }]
      const maxSpendInfo = { ...spendInfo, spendTargets }

      return wallet.makeSpend(maxSpendInfo)
    },
  })

export const useNewTransaction = ({ wallet, spendInfo }: { wallet: EdgeCurrencyWallet; spendInfo: EdgeSpendInfo }) =>
  useQuery({
    queryKey: ['transaction', wallet.id, spendInfo],
    queryFn: () => wallet.makeSpend(spendInfo),
    config: { suspense: false, staleTime: Infinity, cacheTime: 0, useErrorBoundary: false, retry: 0 },
  })
