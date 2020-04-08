import axios from 'axios'
import * as R from 'ramda'

import * as ActivityLog from '@common/activityLog/activityLog'
import * as Survey from '@core/survey/survey'

import * as SurveyState from '@webapp/survey/surveyState'
import * as AppState from '@webapp/app/appState'
import * as ActivityLogState from '@webapp/loggedin/modules/home/dashboard/activityLog/activityLogState'

import * as ActivityLogMessage from './activityLogMessage'
import * as ActivityLogMessageParser from './activityLogMessageParser'

export const homeActivityMessagesUpdate = 'home/activityLog/messages/update'
export const homeActivityMessagesReset = 'home/activityLog/messages/reset'

const fetchActivityLogs = async (state, newest = true) => {
  const activityLogMessagesState = ActivityLogState.getMessages(state)
  const initialized = ActivityLogState.isInitialized(state)
  const survey = SurveyState.getSurvey(state)
  const surveyId = Survey.getId(survey)
  const i18n = AppState.getI18n(state)

  const params = {}
  if (initialized) {
    if (newest) {
      params.idGreaterThan = R.pipe(R.head, ActivityLogMessage.getId)(activityLogMessagesState)
    } else {
      params.idLessThan = R.pipe(R.last, ActivityLogMessage.getId)(activityLogMessagesState)
    }
  }

  const {
    data: { activityLogs },
  } = await axios.get(`/api/survey/${surveyId}/activity-log`, { params })

  if (R.isEmpty(activityLogs)) {
    return null
  }
  // Add new messages to messages already in state
  // Highlight new messages when fetching newest ones
  const highlighted = newest && initialized
  const activityLogMessagesNew = R.map(ActivityLogMessageParser.toMessage(i18n, survey, highlighted))(activityLogs)
  const activityLogMessagesOld = R.map(ActivityLogMessage.dissocHighlighted, activityLogMessagesState)
  return newest
    ? R.concat(activityLogMessagesNew, activityLogMessagesOld)
    : R.concat(activityLogMessagesOld, activityLogMessagesNew)
}

export const fetchActivityLogsNewest = () => async (dispatch, getState) => {
  const activityLogMessages = await fetchActivityLogs(getState())
  if (activityLogMessages)
    await dispatch({
      type: homeActivityMessagesUpdate,
      activityLogMessages,
    })
}

export const fetchActivityLogsNext = () => async (dispatch, getState) => {
  const activityLogMessages = await fetchActivityLogs(getState(), false)
  if (activityLogMessages) {
    // When the activity of type "surveyCreate" is loaded, activity logs load is complete
    const loadComplete = R.any(
      R.pipe(ActivityLogMessage.getType, R.equals(ActivityLog.type.surveyCreate)),
      activityLogMessages
    )
    await dispatch({ type: homeActivityMessagesUpdate, activityLogMessages, loadComplete })
  }
}

export const resetActivityLogs = () => (dispatch) => dispatch({ type: homeActivityMessagesReset })
