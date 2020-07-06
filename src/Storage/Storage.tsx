import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'

import { DataStore } from './DataStore'
import { Disklet } from './Disklet'

export const Storage: React.FC<{ account: EdgeAccount }> = ({ account }) => (
  <div>
    <Disklet disklet={account.disklet} path={'/'} title={'Disklet'} />
    <Disklet disklet={account.localDisklet} path={'/'} title={'Local Disklet'} />
    <DataStore dataStore={account.dataStore} title={'DataStore'} />
  </div>
)
