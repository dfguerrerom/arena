import axios from 'axios'

import DateUtils from '../../../../../../common/dateUtils'

import * as SurveyState from '../../../../../survey/surveyState'
import * as RecordsSummaryState from './recordsSummaryState'

export const recordsSummaryUpdate = 'home/recordsSummary/update'

const formatDate = date => DateUtils.format(date, 'yyyy-MM-dd')

const getFromDate = (date, timeRange) => {
  switch (timeRange) {

    case RecordsSummaryState.timeRanges._2Weeks:
      return DateUtils.subDays(date, 14)

    case RecordsSummaryState.timeRanges._1Month:
      return DateUtils.subMonths(date, 1)

    case RecordsSummaryState.timeRanges._3Months:
      return DateUtils.subMonths(date, 3)

    case RecordsSummaryState.timeRanges._6Months:
      return DateUtils.subMonths(date, 6)

    case RecordsSummaryState.timeRanges._1Year:
      return DateUtils.subYears(date, 1)
  }
}

export const fetchRecordsSummary = timeRange => async (dispatch, getState) => {
  const surveyId = SurveyState.getSurveyId(getState())

  const now = Date.now()
  const from = formatDate(getFromDate(now, timeRange))
  const to = formatDate(now)

  const { data: counts } = await axios.get(
    `/api/survey/${surveyId}/records/summary/count`,
    { params: { from, to } }
  )

  dispatch({ type: recordsSummaryUpdate, timeRange, from, to, counts })
}