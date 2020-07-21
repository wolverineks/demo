import React from 'react'

import { useAccount } from '../auth'
import { DataStore } from './DataStore'
import { Disklet } from './Disklet'

export const Storage: React.FC = () => (
  <div>
    <Disklet disklet={useAccount().disklet} path={'/'} title={'Disklet'} />
    <Disklet disklet={useAccount().localDisklet} path={'/'} title={'Local Disklet'} />
    <DataStore dataStore={useAccount().dataStore} title={'DataStore'} />
  </div>
)
