import * as React from 'react'

export const useTimeout = () => {
  const [{ callback, delay }, set] = React.useState({
    callback: () => null,
    delay: 0,
  })

  React.useEffect(() => {
    const id = setTimeout(callback, delay)

    return () => clearTimeout(id)
  }, [callback, delay])

  const timeout = React.useCallback((callback: () => any, delay: number) => {
    set({ callback, delay })
  }, [])

  return timeout
}
