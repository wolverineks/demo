import * as React from 'react'

import { useAccount } from '../Auth'
import { DataStore } from './DataStore'
import { Disklet } from './Disklet'

export const Storage: React.FC = () => {
  const account = useAccount()

  return (
    <div>
      <Disklet disklet={account.disklet} path={'/'} title={'Disklet'} />
      <Disklet disklet={account.localDisklet} path={'/'} title={'Local Disklet'} />
      <DataStore dataStore={account.dataStore} title={'DataStore'} />
    </div>
  )
}
