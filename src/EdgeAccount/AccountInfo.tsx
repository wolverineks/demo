import React from 'react'
import { Col, Row } from 'react-bootstrap'

import { Boundary } from '../components'
import { SelectedWalletBoundary } from '../SelectedWallet'
import { ExchangeRates } from './ExchangeRates'
import { Main } from './Main'
import { SideMenu } from './SideMenu'

export const AccountInfo = () => {
  return (
    <Row>
      <Col xl={3} lg={3} md={3} sm={3}>
        <SideMenu />
      </Col>

      <Col>
        <SelectedWalletBoundary fallback={<div>No Selected Wallet</div>}>
          <Main />
        </SelectedWalletBoundary>
      </Col>

      <Col xl={3} lg={3} md={3} sm={3}>
        <Boundary>
          <ExchangeRates />
        </Boundary>
      </Col>
    </Row>
  )
}
