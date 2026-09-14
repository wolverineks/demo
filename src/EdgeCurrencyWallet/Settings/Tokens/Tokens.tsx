import { EdgeCurrencyWallet, EdgeMetaToken } from 'edge-core-js'
import React from 'react'

import { useSelectWallet } from '../../../App'
import {
  Accordion,
  Boundary,
  Button,
  FormControl,
  FormGroup,
  FormLabel,
  ListGroup,
  Logo,
  Select,
} from '../../../components'
import { useTokens } from '../../../hooks'
import { AddToken } from './AddToken'
import { StatusFilter, useFilteredTokenInfos } from './useFilteredTokenInfos'

export const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const tokens = useTokens(wallet)
  const availableTokens = [...Object.values(tokens.customTokenInfos), ...Object.values(tokens.includedInfos)].length > 0

  return !availableTokens ? <NoAvailableTokens /> : <AvailableTokens wallet={wallet} />
}

const NoAvailableTokens = () => (
  <FormGroup>
    <FormLabel>Tokens</FormLabel>
    <ListGroup.Item>No Tokens Available</ListGroup.Item>
  </FormGroup>
)

const AvailableTokens = ({ wallet }: { wallet: EdgeCurrencyWallet }) => {
  const tokens = useTokens(wallet)
  const [, select] = useSelectWallet()
  const toggleToken = (currencyCode: string) => {
    if (tokens.enabled.includes(currencyCode)) {
      tokens.disable(currencyCode)

      return
    }

    void tokens.enable(currencyCode).then(() => select({ id: wallet.id, currencyCode }))
  }
  const [addToken, setAddToken] = React.useState<'addToken' | undefined>()
  const [editTokenInfo, setEditTokenInfo] = React.useState<EdgeMetaToken | undefined>()
  const editToken = (tokenInfo: EdgeMetaToken) => {
    setAddToken('addToken')
    setEditTokenInfo(tokenInfo)
  }
  const { setSearchQuery, setStatusFilter, ...filteredTokenInfos } = useFilteredTokenInfos(wallet)
  const matchingTokenInfos =
    [...Object.values(filteredTokenInfos.custom), ...Object.values(filteredTokenInfos.included)].length > 0

  return (
    <FormGroup>
      <FormLabel>Tokens</FormLabel>
      <Accordion activeKey={addToken}>
        <Accordion.Toggle eventKey={'addToken'}>
          <Button onClick={() => setAddToken(undefined)}>+</Button>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={'addToken'}>
          <AddToken wallet={wallet} tokenInfo={editTokenInfo} onSuccess={() => setAddToken(undefined)} />
        </Accordion.Collapse>
      </Accordion>

      <FilterForm setStatusFilter={setStatusFilter} setSearchQuery={setSearchQuery} />

      {!matchingTokenInfos ? (
        <NoMatchingTokens />
      ) : (
        <MatchingTokens
          includedTokenInfos={filteredTokenInfos.included}
          customTokenInfos={filteredTokenInfos.custom}
          enabledTokenCurrencyCodes={tokens.enabled}
          editToken={editToken}
          toggleToken={toggleToken}
        />
      )}
    </FormGroup>
  )
}

const FilterForm = ({
  setStatusFilter,
  setSearchQuery,
}: {
  setStatusFilter: (status: StatusFilter) => unknown
  setSearchQuery: (query: string) => unknown
}) => (
  <>
    <FormControl placeholder={'Search'} onChange={(event) => setSearchQuery(event.currentTarget.value)} />
    <Select
      onSelect={(event) => setStatusFilter(event.currentTarget.value)}
      title={'Filter'}
      options={[
        { display: 'All', value: StatusFilter.all },
        { display: 'Enabled', value: StatusFilter.enabledOnly },
        { display: 'Disabled', value: StatusFilter.disabledOnly },
      ]}
      renderOption={(option) => (
        <option key={option.value} value={option.value}>
          {option.display}
        </option>
      )}
    />
  </>
)

const NoMatchingTokens = () => <ListGroup.Item>No Matching Tokens</ListGroup.Item>

const MatchingTokens = ({
  customTokenInfos,
  includedTokenInfos,
  enabledTokenCurrencyCodes,
  editToken,
  toggleToken,
}: {
  customTokenInfos: EdgeMetaToken[]
  includedTokenInfos: EdgeMetaToken[]
  enabledTokenCurrencyCodes: string[]
  editToken: (tokenInfo: EdgeMetaToken) => unknown
  toggleToken: (currencyCode: string) => unknown
}) => (
  <>
    <TokenList
      tokenInfos={customTokenInfos}
      renderRow={(tokenInfo: EdgeMetaToken) => (
        <TokenRow
          key={tokenInfo.currencyCode}
          isEnabled={enabledTokenCurrencyCodes.includes(tokenInfo.currencyCode)}
          tokenInfo={tokenInfo}
          onEdit={editToken}
          onClick={toggleToken}
          canEdit
        />
      )}
    />

    <TokenList
      tokenInfos={includedTokenInfos}
      renderRow={(tokenInfo: EdgeMetaToken) => (
        <TokenRow
          key={tokenInfo.currencyCode}
          isEnabled={enabledTokenCurrencyCodes.includes(tokenInfo.currencyCode)}
          tokenInfo={tokenInfo}
          onEdit={editToken}
          onClick={toggleToken}
        />
      )}
    />
  </>
)

const TokenList = ({
  tokenInfos,
  renderRow,
}: {
  tokenInfos: EdgeMetaToken[]
  renderRow: (tokenInfo: EdgeMetaToken) => JSX.Element
}) => (
  <>
    {Object.values(tokenInfos)
      .sort((a, b) => a.currencyCode.localeCompare(b.currencyCode))
      .map(renderRow)}
  </>
)

const TokenRow: React.FC<{
  tokenInfo: EdgeMetaToken
  isEnabled: boolean
  onEdit: (tokenInfo: EdgeMetaToken) => void
  onClick: (currencyCode: string) => void
  canEdit?: boolean
}> = ({ tokenInfo, isEnabled, onClick, onEdit, canEdit }) => {
  const { currencyName, displayName } = tokenInfo as any

  return (
    <ListGroup.Item
      key={tokenInfo.currencyCode}
      className="token-picker-row"
      variant={isEnabled ? 'primary' : undefined}
      onClick={() => onClick(tokenInfo.currencyCode)}
    >
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo
          currencyCode={tokenInfo.currencyCode}
          pluginId={(tokenInfo as any).pluginId}
          tokenId={(tokenInfo as any).tokenId}
          contractAddress={tokenInfo.contractAddress}
        />
      </Boundary>{' '}
      {tokenInfo.currencyCode} - {currencyName || displayName}
      {canEdit ? (
        <Button
          onClick={(event) => {
            event.stopPropagation()
            onEdit(tokenInfo)
          }}
          style={{ float: 'right' }}
        >
          EDIT
        </Button>
      ) : null}
    </ListGroup.Item>
  )
}
