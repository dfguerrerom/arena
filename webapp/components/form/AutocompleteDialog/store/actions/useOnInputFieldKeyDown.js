import { useCallback } from 'react'
import { KeyboardMap } from '@webapp/utils/keyboardMap'
import { State } from '../state'

export const useOnInputFieldKeyDown = ({ onClose, focusItem }) =>
  useCallback(
    ({ list, state }) => (event) => {
      const items = State.getItems(state)
      const inputField = State.getInputField(state)
      switch (event.keyCode) {
        case KeyboardMap.Down:
        case KeyboardMap.Tab:
          if (items.length > 0) {
            event.preventDefault()
            // Focus first item
            focusItem({ list, index: 0 })
          } else {
            onClose()
          }

          break
        case KeyboardMap.Esc:
          onClose()
          inputField.focus()
          break
        default:
        // Do nothing
      }
    },
    []
  )
