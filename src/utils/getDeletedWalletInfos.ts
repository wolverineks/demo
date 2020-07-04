import { EdgeAccount } from 'edge-core-js'

export const getDeletedWalletInfos = ({ account }: { account: EdgeAccount }) =>
  account.allKeys.filter(({ deleted }) => deleted)
