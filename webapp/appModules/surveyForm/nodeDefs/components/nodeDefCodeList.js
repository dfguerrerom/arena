import '../nodeDefs.scss'

import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import * as R from 'ramda'

import CodeListDropdown from './codeList/codeListDropdown'
import CodeListCheckbox from './codeList/codeListCheckbox'
import { FormItem } from '../../../../commonComponents/form/input'

import NodeDef from '../../../../../common/survey/nodeDef'
import Survey from '../../../../../common/survey/survey'
import Record from '../../../../../common/record/record'
import { isRenderDropdown, nodeDefRenderType } from '../../../../../common/survey/nodeDefLayout'

import { toQueryString } from '../../../../../server/serverUtils/request'
import { getStateSurveyInfo, getSurvey } from '../../../../survey/surveyState'
import { getRecord } from '../../record/recordState'
import { getSurveyForm } from '../../surveyFormState'

const CodeListRenderer = props =>
  isRenderDropdown(props.nodeDef)
    ? <CodeListDropdown {...props}/>
    : <CodeListCheckbox {...props}/>

class NodeDefCodeList extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      items: [],
    }
  }

  async componentDidMount () {
    const {edit} = this.props

    if (!edit) {
      await this.loadCodeListItems()
    }
  }

  async componentDidUpdate (prevProps) {
    const {ancestorCodes, nodeDefParentCodeUUID} = this.props

    if (nodeDefParentCodeUUID) {
      const {ancestorCodes: prevAncestorCodes} = prevProps

      //ancestor codes changed, reload items
      if (!R.equals(ancestorCodes, prevAncestorCodes)) {
        await this.loadCodeListItems()
      }
    }
  }

  async loadCodeListItems () {
    const {surveyInfo, codeListId, ancestorCodes} = this.props

    if (codeListId) {
      const params = {draft: false, ancestorCodes}
      const {data} = await axios.get(`/api/survey/${surveyInfo.id}/codeLists/${codeListId}/candidateItems?${toQueryString(params)}`)

      this.setState({items: data.items})
    } else {
      this.setState({items: []})
    }
  }

  render () {
    const {edit, label, renderType} = this.props
    const {items} = this.state

    // table header
    if (renderType === nodeDefRenderType.tableHeader) {
      return <label className="node-def__table-header">
        {label}
      </label>
    }

    // EDIT MODE
    if (edit)
      return <FormItem label={label}>
        <CodeListDropdown {...this.props} />
      </FormItem>

    // ENTRY MODE
    if (renderType === nodeDefRenderType.tableBody) {
      return <CodeListRenderer {...this.props}
                               items={items}/>
    } else {
      return (
        <FormItem label={label}>
          <CodeListRenderer {...this.props}
                            items={items}/>
        </FormItem>
      )
    }
  }
}

const mapStateToProps = (state, props) => {
  const survey = getSurvey(state)
  const surveyForm = getSurveyForm(state)
  const surveyInfo = getStateSurveyInfo(state)

  const record = getRecord(surveyForm)
  const {nodeDef, parentNode} = props

  const ancestorCodes = Record.getNodeCodeAncestorValues(survey, parentNode, nodeDef)(record)

  const levelIndex = Survey.getNodeDefCodeListLevelIndex(nodeDef)(survey)
  const codeList = ancestorCodes.length === levelIndex
    ? Survey.getCodeListByUUID(NodeDef.getNodeDefCodeListUUID(nodeDef))(survey)
    : null

  return {
    surveyInfo: surveyInfo,
    language: Survey.getDefaultLanguage(surveyInfo),
    nodeDefParentCodeUUID: NodeDef.getNodeDefParentCodeUUID(nodeDef),
    ancestorCodes,
    // codeListId is not null when items can be loaded from server
    codeListId: codeList ? codeList.id : null,
  }
}

export default connect(mapStateToProps)(NodeDefCodeList)