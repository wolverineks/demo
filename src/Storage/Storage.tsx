import React from 'react'

import { useEdgeAccount } from '../auth'
import { useUsername } from '../hooks'
import { DataStore } from './DataStore'
import { Disklet } from './Disklet'

export const Storage = () => {
  const account = useEdgeAccount()
  const username = useUsername(account)

  return (
    <div>
      <Disklet id={[username, 'disklet']} disklet={account.disklet} path={'/'} title={'Disklet'} />
      <Disklet id={[username, 'localDisklet']} disklet={account.localDisklet} path={'/'} title={'Local Disklet'} />
      <DataStore dataStore={account.dataStore} title={'DataStore'} />
    </div>
  )
}
