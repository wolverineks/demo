import React from 'react'
import { Col, Row } from 'react-bootstrap'

import { Boundary } from '../components'
import { ExchangeRates } from './ExchangeRates'
import { Main } from './Main'
import { SideMenu } from '.'

export const Layout = () => {
  return (
    <Row>
      <Col xl={3} lg={3} md={3} sm={3}>
        <SideMenu />
      </Col>

      <Col>
        <Main />
      </Col>

      <Col xl={3} lg={3} md={3} sm={3}>
        <Boundary>
          <ExchangeRates />
        </Boundary>
      </Col>
    </Row>
  )
}
