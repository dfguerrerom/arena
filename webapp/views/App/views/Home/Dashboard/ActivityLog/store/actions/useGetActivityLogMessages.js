import * as R from 'ramda'

import { useState } from 'react'

import * as A from '@core/arena'

import { useInterval, useRequest } from '@webapp/components/hooks'

import * as API from '@webapp/service/api'

import { useSurvey, useSurveyId } from '@webapp/store/survey'
import { useI18n } from '@webapp/store/system'

import * as ActivityLogMessage from '../activityLogMessage'
import * as ActivityLogMessageParser from '../parsers'

export const useFetchMessages = ({ messages, setMessages }) => {
  const i18n = useI18n()
  const survey = useSurvey()
  const surveyId = useSurveyId()
  const [params, setParams] = useState({})
  const [newest, setNewest] = useState({})
  const [hasToFetch, setHasToFetch] = useState(false)

  const prepareData = (fetchedData) => {
    const initialized = messages.length > 0
    const { activityLogs } = fetchedData
    if (A.isEmpty(activityLogs)) {
      return null
    }
    const highlighted = newest && initialized

    const messagesNew = R.map(ActivityLogMessageParser.toMessage(i18n, survey, highlighted))(activityLogs)
    const messagesOld = R.map(ActivityLogMessage.dissocHighlighted, messages)
    const newMessages = newest ? R.concat(messagesNew, messagesOld) : R.concat(messagesOld, messagesNew)
    if (newMessages) {
      setMessages(newMessages)
    }
    return newMessages
  }

  useRequest({
    condition: hasToFetch,
    defaultValue: [],
    requestFunction: API.fetchActivityLogs,
    requestArguments: [{ surveyId, params }],
    prepareData,
    dependencies: [params],
  })

  return ({ newest: _newest }) => {
    const _params = {}
    const initialized = messages.length > 0

    if (initialized) {
      if (_newest) {
        _params.idGreaterThan = R.pipe(R.head, ActivityLogMessage.getId)(messages)
      } else {
        _params.idLessThan = R.pipe(R.last, ActivityLogMessage.getId)(messages)
      }
    }

    setParams(_params)
    setNewest(_newest)
    if (!hasToFetch) {
      setHasToFetch(true)
    }
  }
}

export const useGetActivityLogMessages = ({ messages, setMessages }) => {
  const fetchMessages = useFetchMessages({ messages, setMessages })

  useInterval(() => messages.length > 0 && fetchMessages({ newest: true }), 3000)

  return () => {
    ;(async () => fetchMessages({ newest: true }))()
  }
}

export const useGetActivityLogMessagesNext = ({ messages, setMessages }) => {
  const fetchMessages = useFetchMessages({ messages, setMessages })
  return () => {
    ;(async () => fetchMessages({ newest: false }))()
  }
}
