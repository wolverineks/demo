import { EdgeCurrencyWallet } from 'edge-core-js'
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
import { TokenInfo, useTokens } from '../../../hooks'
import { AddToken } from './AddToken'
import { StatusFilter, useFilteredTokenInfos } from './useFilteredTokenInfos'

export const Tokens: React.FC<{ wallet: EdgeCurrencyWallet }> = ({ wallet }) => {
  const { availableTokenInfos } = useTokens(wallet)

  return availableTokenInfos.length > 0 ? <AvailableTokens wallet={wallet} /> : <NoAvailableTokens />
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
  const toggleToken = (tokenId: string) => {
    if (tokens.enabledTokenIds.includes(tokenId)) {
      tokens.disable(tokenId)

      return
    }

    void tokens.enable(tokenId).then(() => select({ id: wallet.id, tokenId }))
  }
  const [addToken, setAddToken] = React.useState<'addToken' | undefined>()
  const [editTokenInfo, setEditTokenInfo] = React.useState<TokenInfo | undefined>()
  const editToken = (tokenInfo: TokenInfo) => {
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
          enabledTokenIds={tokens.enabledTokenIds}
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
  enabledTokenIds,
  editToken,
  toggleToken,
}: {
  customTokenInfos: TokenInfo[]
  includedTokenInfos: TokenInfo[]
  enabledTokenIds: string[]
  editToken: (tokenInfo: TokenInfo) => unknown
  toggleToken: (tokenId: string) => unknown
}) => (
  <>
    <TokenList
      tokenInfos={customTokenInfos}
      renderRow={(tokenInfo: TokenInfo) => (
        <TokenRow
          key={tokenInfo.tokenId}
          isEnabled={enabledTokenIds.includes(tokenInfo.tokenId)}
          tokenInfo={tokenInfo}
          onEdit={editToken}
          onClick={toggleToken}
          canEdit
        />
      )}
    />

    <TokenList
      tokenInfos={includedTokenInfos}
      renderRow={(tokenInfo: TokenInfo) => (
        <TokenRow
          key={tokenInfo.tokenId}
          isEnabled={enabledTokenIds.includes(tokenInfo.tokenId)}
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
  tokenInfos: TokenInfo[]
  renderRow: (tokenInfo: TokenInfo) => JSX.Element
}) => (
  <>
    {Object.values(tokenInfos)
      .sort((a, b) => a.currencyCode.localeCompare(b.currencyCode))
      .map(renderRow)}
  </>
)

const TokenRow: React.FC<{
  tokenInfo: TokenInfo
  isEnabled: boolean
  onEdit: (tokenInfo: TokenInfo) => void
  onClick: (tokenId: string) => void
  canEdit?: boolean
}> = ({ tokenInfo, isEnabled, onClick, onEdit, canEdit }) => {
  return (
    <ListGroup.Item
      key={tokenInfo.tokenId}
      className="token-picker-row"
      variant={isEnabled ? 'primary' : undefined}
      onClick={() => onClick(tokenInfo.tokenId)}
    >
      <Boundary error={{ fallback: null }} suspense={{ fallback: null }}>
        <Logo pluginId={tokenInfo.pluginId} tokenId={tokenInfo.tokenId} contractAddress={tokenInfo.contractAddress} />
      </Boundary>{' '}
      {tokenInfo.currencyCode} - {tokenInfo.currencyName}
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
