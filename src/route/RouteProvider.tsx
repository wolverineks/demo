import React from 'react'

export enum Route {
  'account' = 'account',
  'settings' = 'settings',
  'createWallet' = 'createWallet',
}
type SetRoute = (route: Route) => undefined

const RouteContext = React.createContext<string>(Route.account)
const SetRouteContext = React.createContext<SetRoute>(() => undefined)

export const RouteProvider: React.FC = ({ children }) => {
  const [route, setRoute] = React.useState<string>(Route.account)

  return (
    <RouteContext.Provider value={route}>
      <SetRouteContext.Provider value={setRoute as SetRoute}>{children}</SetRouteContext.Provider>
    </RouteContext.Provider>
  )
}

export const RouteConsumer = ({ children }: { children: (route: string) => any }) => children(useRoute())

const missingContext = () => {
  throw new Error('useRoute must be rendered inside a <RouteProvider>')
}

export const useSetRoute = () => React.useContext(SetRouteContext)
export const useRoute = () => React.useContext(RouteContext) || missingContext()
