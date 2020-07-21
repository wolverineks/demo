import React from 'react'
import { CallbackRemover } from 'yaob'

type Watch<EdgeObject, Property extends keyof EdgeObject> = (
  property: Property,
  callback: (property: EdgeObject[Property]) => any,
) => CallbackRemover

export const useWatch = <EdgeObject extends { watch: Watch<EdgeObject, Property> }, Property extends keyof EdgeObject>(
  object: EdgeObject,
  property: Property,
): EdgeObject[Property] => {
  const [, rerender] = React.useState({})
  React.useEffect(() => {
    const unsub = object.watch(property, () => rerender({}))

    return () => {
      unsub()
    }
  }, [object, property])

  return object[property]
}

export const useWatchAll = <
  EdgeObject extends { watch: Watch<EdgeObject, keyof EdgeObject> },
  Properties extends Readonly<(keyof EdgeObject)[]>
>(
  object: EdgeObject,
  properties: Properties = (Object.keys(object) as unknown) as Properties,
) => {
  const [, rerender] = React.useState({})
  React.useEffect(() => {
    const subscribe = (key: keyof EdgeObject) => object.watch(key, () => rerender({}))
    const unsubs = properties.map(subscribe)

    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  }, [object, properties])

  return object
}
