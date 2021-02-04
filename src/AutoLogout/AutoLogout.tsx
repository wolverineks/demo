import React from 'react'
import { useIdleTimer } from 'react-idle-timer'

import { useEdgeAccount } from '../auth'
import { useAutoLogout, useLogout } from '../hooks'

export const AutologoutContext = React.createContext<number>(Infinity)

export const AutologoutProvider: React.FC = ({ children }) => {
  const account = useEdgeAccount()
  const [{ enabled, delay }] = useAutoLogout(account)
  const logout = useLogout()
  const [remainingTime, setRemainingTime] = React.useState(delay)
  const { getRemainingTime, resume, pause } = useIdleTimer({ timeout: delay * 1000, onIdle: logout })

  React.useEffect(() => {
    enabled && resume()
    !enabled && pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  React.useEffect(() => {
    setInterval(() => setRemainingTime(getRemainingTime()), 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AutologoutContext.Provider value={remainingTime}>{children}</AutologoutContext.Provider>
}
