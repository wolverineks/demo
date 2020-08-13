import React from 'react'
import { CallbackRemover } from 'yaob'

type Cleanup = () => void

type Callback<T, U extends keyof T> = (data: T[U]) => any
type Watch<T, U extends keyof T = keyof T> = (property: U, callback: Callback<T, U>) => CallbackRemover
interface Watchable<T> {
  watch: Watch<T>
}

export type Maybe<T> = T | undefined | null

type UseWatch = <T extends Watchable<T>, U extends keyof T>(
  object: Maybe<T>,
  property: U,
  callback?: Callback<T, U>,
) => void

export const useWatch: UseWatch = (object, property, callback) => {
  const [, rerender] = React.useState(object ? object[property] : undefined)
  React.useEffect(() => {
    if (!object) return

    return object.watch(property, () => {
      callback && callback(object[property])
      rerender(object[property])
    }) as Cleanup
  }, [callback, object, property])
}

export const useWatchAll = <T extends Watchable<T>, U extends readonly (keyof T)[]>(
  object: T | undefined,
  properties = ((object ? Object.keys(object) : []) as unknown) as U,
) => {
  const [, rerender] = React.useState({})
  React.useEffect(() => {
    if (!object) return

    const unsubs = properties.map((key) => object.watch(key, () => rerender({})))

    return () => unsubs.forEach((unsub) => unsub())
  }, [object, properties])
}
