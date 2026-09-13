import React from 'react'

import { Boundary, Col, Row } from '../components'
import { ExchangeRates } from './ExchangeRates'
import { Main } from './Main'
import { SideMenu } from '.'

export const Layout = () => {
  return (
    <Row className="app-layout">
      <Col xl={3} lg={3} md={4} sm={12}>
        <div className="panel">
          <SideMenu />
        </div>
      </Col>

      <Col>
        <div className="panel panel--main">
          <Main />
        </div>
      </Col>

      <Col xl={3} lg={3} md={4} sm={12}>
        <div className="panel">
          <Boundary>
            <ExchangeRates />
          </Boundary>
        </div>
      </Col>
    </Row>
  )
}
