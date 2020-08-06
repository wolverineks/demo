import React from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

const defaultSuspense = { fallback: <div>Loading...</div> }

const fallbackRender = ({ error }: FallbackProps) => <div>Error: {error?.message}</div>
const defaultError = { fallbackRender }

export const Boundary: React.FC<{
  suspense?: Partial<React.ComponentProps<typeof React.Suspense>>
  error?: Partial<React.ComponentProps<typeof ErrorBoundary>>
  suspend?: boolean
  catch?: boolean
}> = ({ children, ...props }) => {
  const CatchBoundary = props.catch !== false ? ErrorBoundary : React.Fragment
  const SuspendBoundary = props.suspend !== false ? React.Suspense : React.Fragment

  return (
    <SuspendBoundary {...defaultSuspense} {...props.suspense}>
      <CatchBoundary {...defaultError} {...props.error}>
        {children}
      </CatchBoundary>
    </SuspendBoundary>
  )
}
