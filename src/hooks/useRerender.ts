import React from 'react'

export const useRerender = () => {
  const [, setVersion] = React.useState(0)

  return React.useCallback(() => setVersion((version) => version + 1), [])
}
