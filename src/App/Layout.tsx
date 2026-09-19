import React from 'react'

import { Boundary, Col, Row } from '../components'
import { ExchangeRates } from './ExchangeRates'
import { Main } from './Main'
import { SideMenu } from '.'

export const Layout = () => {
  return (
    <Row className="app-layout">
      <Col className="app-layout__side" xl={3} lg={3} md={4} sm={12}>
        <div className="panel">
          <SideMenu />
        </div>
      </Col>

      <Col className="app-layout__main" xl={6} lg={6} md={4} sm={12}>
        <div className="panel panel--main">
          <Main />
        </div>
      </Col>

      <Col className="app-layout__rates" xl={3} lg={3} md={4} sm={12}>
        <div className="panel panel--rates">
          <Boundary>
            <ExchangeRates />
          </Boundary>
        </div>
      </Col>
    </Row>
  )
}
