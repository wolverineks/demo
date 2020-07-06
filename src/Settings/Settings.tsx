import * as React from 'react'
import { ListGroup } from 'react-bootstrap'
import { ErrorBoundary } from 'react-error-boundary'

import { AutoLogout } from '../AutoLogout'
import { DefaultFiat } from '../Fiat'
import { PinLogin } from '../PinLogin'
import { Currencies } from './Currencies'

export const Settings = () => {
  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error?.message}</div>}>
        <React.Suspense fallback={<div>AutoLogout loading...</div>}>
          <AutoLogout />
        </React.Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error?.message}</div>}>
        <React.Suspense fallback={<div>Default Fiat loading...</div>}>
          <DefaultFiat />
        </React.Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error?.message}</div>}>
        <React.Suspense fallback={<div>PinLogin loading...</div>}>
          <PinLogin />
        </React.Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallbackRender={({ error }) => <div>Error: {error?.message}</div>}>
        <React.Suspense fallback={<div>Currencies loading...</div>}>
          <Currencies />
        </React.Suspense>
      </ErrorBoundary>
    </ListGroup>
  )
}
