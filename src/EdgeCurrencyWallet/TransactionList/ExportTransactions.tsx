import { EdgeCurrencyWallet, EdgeTokenId } from 'edge-core-js'
import React from 'react'
import DatePicker from 'react-date-picker'
import JSONPretty from 'react-json-pretty'

import { Accordion, Button, Col, Debug, Form, FormControl, Row } from '../../components'
import { ExportTransactionsOptions, useCryptoDenominations, useExportTransactions } from '../../hooks'

const readCount = (value: string) => {
  if (value.trim() === '') return undefined

  const parsed = Number(value)

  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : undefined
}

export const ExportTransactions = ({
  wallet,
  tokenId,
  isActive,
}: {
  wallet: EdgeCurrencyWallet
  tokenId: EdgeTokenId
  isActive: boolean
}) => {
  const { display, all } = useCryptoDenominations(wallet.currencyInfo.pluginId, tokenId)

  const [options, setOptions] = React.useState<ExportTransactionsOptions>({
    tokenId,
    denomination: display.multiplier,
  })

  React.useEffect(() => {
    setOptions((current) =>
      current.tokenId === tokenId ? current : { ...current, tokenId, denomination: display.multiplier },
    )
  }, [tokenId, display.multiplier])

  const { data, isLoading } = useExportTransactions(wallet, options)
  const href = React.useMemo(() => window.URL.createObjectURL(new Blob([data || ''], { type: 'text/csv' })), [data])

  return (
    <Accordion style={{ flex: 1 }} defaultActiveKey={'0'} activeKey={isActive ? 'export' : undefined}>
      <Accordion.Collapse eventKey="export">
        <Form>
          <Form.Group>
            <Row>
              <Col>
                <Form.Label>Search String</Form.Label>
                <FormControl
                  onChange={(event) => setOptions({ ...options, searchString: event.currentTarget.value })}
                />
              </Col>

              <Col>
                <Form.Label>Denomination</Form.Label>
                <Form.Control
                  as="select"
                  value={options.denomination}
                  onChange={(event) => setOptions({ ...options, denomination: event.currentTarget.value })}
                >
                  {all.map((denomination) => (
                    <option key={denomination.multiplier} value={denomination.multiplier}>
                      {denomination.symbol} - {denomination.name}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Row>
          </Form.Group>

          <Form.Group>
            <Row>
              <Col>
                <Form.Label>Start Index</Form.Label>
                <FormControl
                  type="number"
                  min={0}
                  value={options.startIndex ?? ''}
                  onChange={(event) => setOptions({ ...options, startIndex: readCount(event.currentTarget.value) })}
                />
              </Col>

              <Col>
                <Form.Label>Start Entries</Form.Label>
                <FormControl
                  type="number"
                  min={0}
                  value={options.startEntries ?? ''}
                  onChange={(event) => setOptions({ ...options, startEntries: readCount(event.currentTarget.value) })}
                />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group>
            <Row>
              <Col>
                <Form.Label>Start Date</Form.Label>
                <DatePicker
                  name={'Start Date'}
                  value={options.startDate ? options.startDate : undefined}
                  onChange={(date) => (Array.isArray(date) ? null : setOptions({ ...options, startDate: date }))}
                />
              </Col>

              <Col>
                <Form.Label>End Date</Form.Label>
                <DatePicker
                  name={'End Date'}
                  value={options.endDate ? options.endDate : undefined}
                  onChange={(date) => (Array.isArray(date) ? null : setOptions({ ...options, endDate: date }))}
                />
              </Col>
            </Row>
          </Form.Group>

          <Button disabled={isLoading} href={href}>
            Export
          </Button>

          <Debug>
            <JSONPretty data={options} />
          </Debug>
        </Form>
      </Accordion.Collapse>
    </Accordion>
  )
}
