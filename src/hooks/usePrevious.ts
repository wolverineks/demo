import React from 'react'

export const usePrevious = <T>({ data, initialData }: { data: T | undefined; initialData?: any }) => {
  const ref = React.useRef<T>(initialData)
  React.useEffect(() => {
    if (!data) return
    ref.current = data
  })

  return ref.current
}
