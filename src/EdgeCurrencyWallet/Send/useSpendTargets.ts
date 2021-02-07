import { EdgeSpendTarget } from 'edge-core-js'
import * as React from 'react'

type State = (EdgeSpendTarget & { id: number })[]
type Action =
  | { type: 'ADD_SPEND_TARGET' }
  | { type: 'REMOVE_SPEND_TARGET'; index: number }
  | { type: 'UPDATE_SPEND_TARGET'; index: number; spendTarget: Partial<EdgeSpendTarget> }

let spendTargetsCounter = 0 // add id to spendTarget to use as component key

export const useSpendTargets = () => {
  const [spendTargets, dispatch] = React.useReducer(
    (state: State, action: Action) => {
      switch (action.type) {
        case 'ADD_SPEND_TARGET':
          return [
            ...state,
            {
              id: (spendTargetsCounter += 1),
              publicAddress: '',
              nativeAmount: '0',
              uniqueIdentifier: '',
              otherParams: {},
            },
          ]

        case 'REMOVE_SPEND_TARGET':
          return state.filter((_, index) => index !== action.index)

        case 'UPDATE_SPEND_TARGET':
          return state.map((spendTarget, index) =>
            index === action.index ? { ...spendTarget, ...action.spendTarget } : spendTarget,
          )

        default:
          throw new Error('Invalid Action')
      }
    },
    [{ id: 0, publicAddress: '', nativeAmount: '0', uniqueIdentifier: '', otherParams: {} }],
  )

  const add = () => dispatch({ type: 'ADD_SPEND_TARGET' })
  const remove = (index: number) => dispatch({ type: 'REMOVE_SPEND_TARGET', index })
  const update = (index: number, spendTarget: Partial<EdgeSpendTarget>) =>
    dispatch({ type: 'UPDATE_SPEND_TARGET', spendTarget, index })

  return {
    all: spendTargets,
    add: React.useCallback(add, []),
    remove: React.useCallback(remove, []),
    update: React.useCallback(update, []),
  }
}
