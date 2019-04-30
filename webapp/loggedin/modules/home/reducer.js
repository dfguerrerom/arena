import { combineReducers } from 'redux'

import surveys from './surveyList/reducer'
import surveyCreate from './surveyCreate/reducer'
import collectImportReport from './collectImportReport/reducer'

export default combineReducers({
  surveys,
  surveyCreate,
  collectImportReport,
})