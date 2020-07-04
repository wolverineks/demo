import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Form, FormControl, FormGroup, FormLabel, ListGroup, ListGroupItem } from 'react-bootstrap'

import { fiatInfos } from './fiatInfos'
import { getFiatInfo } from './getFiatInfo'
import { useDefaultFiatCurrencyCode } from './useDefaultFiatCurrencyCode'

export const DefaultFiat = ({ account }: { account: EdgeAccount }) => {
  const [currencyCode, write] = useDefaultFiatCurrencyCode({
    account,
  })

  const defaultFiatInfo = getFiatInfo({ currencyCode })

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Form>
          <FormGroup>
            <FormLabel>Default Fiat: {currencyCode}</FormLabel>
            <FormControl
              as={'select'}
              onChange={(event) => write(event.currentTarget.value)}
              defaultValue={currencyCode}
            >
              {defaultFiatInfo && (
                <option key={defaultFiatInfo.isoCurrencyCode} value={defaultFiatInfo.isoCurrencyCode}>
                  {defaultFiatInfo.symbol} - {defaultFiatInfo.currencyCode}
                </option>
              )}
              {fiatInfos.map((info) => (
                <option key={info.isoCurrencyCode} value={info.isoCurrencyCode}>
                  {info.symbol} - {info.currencyCode}
                </option>
              ))}
            </FormControl>
          </FormGroup>
        </Form>
      </ListGroupItem>
    </ListGroup>
  )
}
