import { EdgeAccount, EdgeWalletInfoFull } from 'edge-core-js'

export const getArchivedWalletInfos = ({ account }: { account: EdgeAccount }) =>
  account.allKeys.filter(({ archived, deleted }) => archived && !deleted) as EdgeWalletInfoFull[]
