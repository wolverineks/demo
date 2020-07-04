import { EdgeContext } from 'edge-core-js'

export const getAccountsWithPinLogin = ({ context }: { context: EdgeContext }) =>
  context.localUsers.filter(({ pinLoginEnabled }) => pinLoginEnabled)
