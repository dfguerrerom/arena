import axios from 'axios'
import * as R from 'ramda'

import { surveyCreate } from '../../../survey/actions'
import { showAppJobMonitor } from '../../appView/components/job/actions'

import * as SurveyCreateState from './surveyCreateState'

import { fetchSurveys } from '../surveyList/actions'

export const surveyCreateNewSurveyUpdate = 'surveyCreate/newSurvey/update'

export const updateNewSurveyProp = (name, value) => (dispatch, getState) => {

  const newSurvey = R.pipe(
    SurveyCreateState.getNewSurvey,
    R.dissocPath(['validation', 'fields', name]),
    R.assoc(name, value),
  )(getState())

  dispatch({ type: surveyCreateNewSurveyUpdate, newSurvey })

}
export const createSurvey = surveyProps => async (dispatch, getState) => {

  const { data } = await axios.post('/api/survey', surveyProps)

  const { survey } = data
  const valid = !!survey

  if (valid) {
    dispatch({ type: surveyCreate, survey })
  } else {
    dispatch({
      type: surveyCreateNewSurveyUpdate,
      newSurvey: {
        ...SurveyCreateState.getNewSurvey(getState()),
        ...data,
      }
    })
  }

}
export const importCollectSurvey = file =>
  async dispatch => {
    const formData = new FormData()
    formData.append('file', file)

    const config = { headers: { 'content-type': 'multipart/form-data' } }

    const { data } = await axios.post(`/api/survey/import-from-collect`, formData, config)

    dispatch(showAppJobMonitor(data.job, () => {
      //TODO REMOVE THIS. dispatchCurrentSurveyUpdate should be dispatched. get survey from response
      dispatch(fetchSurveys())
    }))
  }