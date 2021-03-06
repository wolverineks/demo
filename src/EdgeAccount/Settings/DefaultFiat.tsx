import React from 'react'

import { useEdgeAccount } from '../../auth'
import { Form, FormGroup, ListGroup, ListGroupItem, Select } from '../../components'
import { useDefaultFiatCurrencyCode, useDefaultFiatInfo } from '../../hooks'
import { FiatInfo, fiatInfos } from '../../utils'

export const DefaultFiat = () => {
  const account = useEdgeAccount()
  const [currencyCode, write] = useDefaultFiatCurrencyCode(account)
  const defaultFiatInfo = useDefaultFiatInfo(account)

  return (
    <ListGroup style={{ paddingTop: 4, paddingBottom: 4 }}>
      <ListGroupItem>
        <Form>
          <FormGroup>
            <Select
              title={`Default Fiat: ${currencyCode}`}
              defaultValue={defaultFiatInfo.isoCurrencyCode}
              onSelect={(event) => write(event.currentTarget.value)}
              options={displayFiatInfos(defaultFiatInfo)}
              renderOption={({ isoCurrencyCode, currencyCode, symbol }) => (
                <option value={isoCurrencyCode} key={isoCurrencyCode}>
                  {symbol} - {currencyCode}
                </option>
              )}
            />
          </FormGroup>
        </Form>
      </ListGroupItem>
    </ListGroup>
  )
}

const displayFiatInfos = (fiatInfo?: FiatInfo) =>
  fiatInfo ? [fiatInfo, ...fiatInfos.filter(({ currencyCode }) => currencyCode !== fiatInfo.currencyCode)] : fiatInfos
