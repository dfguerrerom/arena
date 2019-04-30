import * as R from 'ramda'

export const applyReducerFunction = (actionHandlers, state = {}, action) => {

  const actionHandler = actionHandlers[action.type]

  return actionHandler
    ? actionHandler(state, action)
    : state
}

export const exportReducer = actionHandlers =>
  (state, action) => applyReducerFunction(actionHandlers, state, action)

export const assocActionProps = (state, {type, ...props}) => ({...state, ...props})

export const dissocStateProps = (state, props) =>
  R.reduce(
    (s, prop) => R.dissoc(prop, s),
    state,
    R.insertAll(0, props, [])
  )

export const debounceAction = (action, key, delay = 500) => {
  action.meta = {
    debounce: {
      time: delay,
      key
    }
  }
  return action
}