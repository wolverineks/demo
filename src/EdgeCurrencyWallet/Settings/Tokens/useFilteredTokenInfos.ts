import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import React from 'react'

import { useTokens } from '../../../hooks'
import { normalize } from '../../../utils'

export enum StatusFilter {
  enabledOnly = 'enabledOnly',
  disabledOnly = 'disabledOnly',
  all = 'all',
}

export const useFilteredTokenInfos = (wallet: EdgeCurrencyWallet) => {
  const tokens = useTokens(wallet)

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>(StatusFilter.all)

  const matches = (tokenInfo: EdgeMetaToken): boolean => {
    const isEnabled = tokens.enabled.includes(tokenInfo.currencyCode)
    const displayFilter =
      statusFilter === StatusFilter.enabledOnly
        ? isEnabled
        : statusFilter === StatusFilter.disabledOnly
        ? !isEnabled
        : true
    const displayMatch =
      normalize(tokenInfo.currencyCode).includes(normalize(searchQuery)) ||
      normalize(tokenInfo.currencyName).includes(normalize(searchQuery)) ||
      normalize(tokenInfo.contractAddress || '').includes(normalize(searchQuery))

    return displayFilter && displayMatch
  }

  return {
    included: Object.values(tokens.includedInfos).filter(matches),
    custom: Object.values(tokens.customTokenInfos).filter(matches),
    setSearchQuery,
    setStatusFilter,
  }
}
