import { combineReducers } from 'redux'

import * as CategoryState from './category/categoryState'
import * as NodeDefEditState from './nodeDefEdit/nodeDefEditState'
import * as RecordState from './record/recordState'
import * as SurveyFormState from './surveyForm/surveyFormState'
import * as TaxonomyState from './taxonomy/taxonomyState'

import category from './category/reducer'
import nodeDefEdit from './nodeDefEdit/reducer'
import record from './record/reducer'
import surveyForm from './surveyForm/reducer'
import taxonomyEdit from './taxonomy/reducer'

export default combineReducers({
  [CategoryState.stateKey]: category,
  [NodeDefEditState.stateKey]: nodeDefEdit,
  [RecordState.stateKey]: record,
  [SurveyFormState.stateKey]: surveyForm,
  [TaxonomyState.stateKey]: taxonomyEdit,
})
