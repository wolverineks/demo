import React from 'react'

import { useEdgeAccount } from '../auth'
import { DataStore } from './DataStore'
import { Disklet } from './Disklet'

export const Storage = () => (
  <div>
    <Disklet disklet={useEdgeAccount().disklet} path={'/'} title={'Disklet'} />
    <Disklet disklet={useEdgeAccount().localDisklet} path={'/'} title={'Local Disklet'} />
    <DataStore dataStore={useEdgeAccount().dataStore} title={'DataStore'} />
  </div>
)
