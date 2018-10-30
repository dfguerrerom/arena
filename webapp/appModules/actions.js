import axios from 'axios/index'

import {
  actionTypes,
  apiUri
} from './appModules'

import { getStateSurveyId } from '../survey/surveyState'

export const fetchData = (module, dashboard) =>
  async (dispatch, getState) => {
    try {

      const surveyId = getStateSurveyId(getState())

      const {data} = await axios.get(apiUri(surveyId, module, dashboard))

      const type = dashboard
        ? actionTypes.appModulesDashboardDataLoaded
        : actionTypes.appModulesDataLoaded

      dispatch({type, ...data})

    } catch (e) {

    }
  }