import { EdgeCurrencyWallet, EdgeGetTransactionsOptions } from 'edge-core-js'
import React from 'react'
import { Accordion, Button, Col, Form, FormControl, Row } from 'react-bootstrap'
import DatePicker from 'react-date-picker'
import JSONPretty from 'react-json-pretty'

import { useEdgeAccount } from '../../auth'
import { Debug } from '../../components'
import { useDenominations, useExportTransactions } from '../../hooks'

export const ExportTransactions = ({
  wallet,
  currencyCode,
  isActive,
}: {
  wallet: EdgeCurrencyWallet
  currencyCode: string
  isActive: boolean
}) => {
  const account = useEdgeAccount()
  const { display, all } = useDenominations(account, currencyCode)

  const [options, setOptions] = React.useState<EdgeGetTransactionsOptions>({
    currencyCode,
    denomination: display.multiplier,
  })
  const [format, setFormat] = React.useState<'CSV' | 'QBO'>('CSV')
  const { data, isLoading } = useExportTransactions(wallet, options, format)
  const href = React.useMemo(
    () => window.URL.createObjectURL(new Blob([data || ''], { type: `text/${format.toLowerCase()}` })),
    [data, format],
  )

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
                <Form.Label>Format</Form.Label>
                <Form.Control as="select" onChange={(event: any) => setFormat(event.currentTarget.value)}>
                  <option key={'CSV'}>CSV</option>
                  <option key={'QBO'}>QBO</option>
                </Form.Control>
              </Col>

              <Col>
                <Form.Label>Denomination</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(event: any) => setOptions({ ...options, denomination: event.currentTarget.value })}
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
                  onChange={(event) => setOptions({ ...options, startIndex: Number(event.currentTarget.value) })}
                />
              </Col>

              <Col>
                <Form.Label>Return Index</Form.Label>
                <FormControl
                  onChange={(event) => setOptions({ ...options, returnIndex: Number(event.currentTarget.value) })}
                />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group>
            <Row>
              <Col>
                <Form.Label>Start Entries</Form.Label>
                <FormControl
                  onChange={(event) => setOptions({ ...options, startEntries: Number(event.currentTarget.value) })}
                />
              </Col>

              <Col>
                <Form.Label>Return Entries</Form.Label>
                <FormControl
                  onChange={(event) => setOptions({ ...options, returnEntries: Number(event.currentTarget.value) })}
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

          <Button target={format === 'QBO' ? 'none' : undefined} disabled={isLoading} href={href}>
            Export
          </Button>

          <Debug>
            <JSONPretty data={{ ...options, format }} />
          </Debug>
        </Form>
      </Accordion.Collapse>
    </Accordion>
  )
}
