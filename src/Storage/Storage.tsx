import React from 'react'

import { useEdgeAccount } from '../auth'
import { DataStore } from './DataStore'
import { Disklet } from './Disklet'

export const Storage = () => {
  const account = useEdgeAccount()

  return (
    <div>
      <Disklet id={[account.username, 'disklet']} disklet={account.disklet} path={'/'} title={'Disklet'} />
      <Disklet
        id={[account.username, 'localDisklet']}
        disklet={account.localDisklet}
        path={'/'}
        title={'Local Disklet'}
      />
      <DataStore dataStore={account.dataStore} title={'DataStore'} />
    </div>
  )
}
