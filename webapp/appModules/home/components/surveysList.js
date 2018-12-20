import './surveysList.scss'

import React from 'react'
import * as R from 'ramda'

import Survey from '../../../../common/survey/survey'
import { getRelativeDate, compareDatesDesc } from '../../../../common/dateUtils'

const SurveyRow = ({surveyInfoRow, surveyInfo, setActiveSurvey}) => {
  const surveyId = surveyInfoRow.id
  const active = surveyInfo && surveyId === surveyInfo.id
  const activeClass = active ? ' active' : ''

  return (
    <div className={`table__row${activeClass}`}>
      <div>{Survey.getName(surveyInfoRow)}</div>
      <div>{Survey.getDefaultLabel(surveyInfoRow)}</div>
      <div>{getRelativeDate(surveyInfoRow.dateCreated)}</div>
      <div>{getRelativeDate(surveyInfoRow.dateModified)}</div>
      <div>{Survey.getStatus(surveyInfoRow)}</div>
      <div>
        <button className={`btn btn-s btn-of${activeClass}`}
                onClick={() => setActiveSurvey(surveyId)}>
          {active ? 'active' : 'activate'}
        </button>
      </div>
    </div>
  )
}

const SurveyList = (props) => {
  const {surveys} = props
  const surveyInfos = surveys.map(Survey.getSurveyInfo)

  return R.isEmpty(surveys)
    ? null
    : (
      <div className="surveys-list table">
        <div className="table__header">
          <h5>Surveys</h5>
        </div>

        <div className="table__row-header">
          <div>Name</div>
          <div>Label</div>
          <div>Date created</div>
          <div>Date last modified</div>
          <div>Status</div>
        </div>


        <div className="table__rows">

          {
            surveyInfos
              .sort((a, b) => compareDatesDesc(a.dateModified, b.dateModified))
              .map((surveyInfo, i) =>
                <SurveyRow key={i} {...props} surveyInfoRow={surveyInfo}/>
              )
          }
        </div>
      </div>
    )
}

export default SurveyList