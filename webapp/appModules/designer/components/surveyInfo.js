import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import * as R from 'ramda'

import { Input } from '../../../commonComponents/form/input'
import InputChips from '../../../commonComponents/form/inputChips'
import LabelsEditorComponent from '../../../survey/components/labelsEditor'
import LanguagesEditorComponent from '../../../survey/components/languagesEditor'

import Survey from '../../../../common/survey/survey'

import { getStateSurveyInfo } from '../../../survey/surveyState'
import { updateSurveyInfoProp } from '../../../survey/surveyInfo/actions'

import { normalizeName } from '../../../../common/stringUtils'
import { getValidation, getFieldValidation } from './../../../../common/validation/validator'

const SrsAutocomplete = props => {
  const {selection, validation, onChange} = props

  const srsLookupFunction = async value => {
    const {data} = await axios.get('/api/srs/find', {
      params: {
        codeOrName: value
      }
    })
    return data.srss
  }

  return <InputChips itemsLookupFunction={srsLookupFunction}
                     itemKeyProp="code"
                     itemLabelProp="name"
                     selection={selection}
                     dropdownAutocompleteMinChars={3}
                     validation={validation}
                     onChange={onChange}/>
}

class SurveyInfo extends React.Component {

  onPropLabelsChange (item, key, currentValue) {
    this.props.updateSurveyInfoProp(key, R.assoc(item.lang, item.label, currentValue))
  }

  render () {
    const {surveyInfo, updateSurveyInfoProp} = this.props
    const validation = getValidation(surveyInfo)
    const surveySrs = Survey.getSRS(surveyInfo)

    return (
      <div className="form">

        <div className="form-item">
          <label className="form-label">Name</label>
          <Input value={Survey.getName(surveyInfo)}
                 validation={getFieldValidation('name')(validation)}
                 onChange={e => updateSurveyInfoProp('name', normalizeName(e.target.value))}/>

        </div>

        <LanguagesEditorComponent/>

        <div className="form-item">
          <label className="form-label">SRS</label>
          <SrsAutocomplete selection={surveySrs}
                           validation={getFieldValidation('srs')}
                           onChange={srs => console.log(srs) || updateSurveyInfoProp('srs', srs)}/>
        </div>

        <LabelsEditorComponent labels={Survey.getLabels(surveyInfo)}
                               onChange={(item) => this.onPropLabelsChange(item, 'labels', Survey.getLabels(surveyInfo))}/>

        <LabelsEditorComponent formLabel="Description(s)"
                               labels={Survey.getDescriptions(surveyInfo)}
                               onChange={(item) => this.onPropLabelsChange(item, 'descriptions', Survey.getDescriptions(surveyInfo))}/>

      </div>
    )
  }

}

const mapStateToProps = state => ({
  surveyInfo: getStateSurveyInfo(state),
})

export default connect(
  mapStateToProps,
  {
    updateSurveyInfoProp,
  }
)(SurveyInfo)