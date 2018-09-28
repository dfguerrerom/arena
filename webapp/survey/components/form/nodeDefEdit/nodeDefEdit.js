import React from 'react'
import { connect } from 'react-redux'

import CommonProps from './commonProps'
import CodeListsView from './../../../codeList/components/codeListsView'

import { getFormNodeDefEdit, getSurvey } from '../../../surveyState'
import { getCodeListUUID } from '../../../../../common/survey/nodeDef'

import { closeFormNodeDefEdit, putNodeDefProp } from '../../../nodeDef/actions'
import { createCodeList } from '../../../codeList/actions'
import { canUpdateCodeList } from '../../../../../common/survey/survey'

class NodeDefEdit extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      editingCodeList: false,
    }
  }

  close () {
    const {nodeDef, closeFormNodeDefEdit} = this.props
    closeFormNodeDefEdit(nodeDef)
  }

  render () {
    const {nodeDef, putNodeDefProp, survey} = this.props

    return nodeDef
      ? (
        <div className="survey-form__node-def-edit">
          {
            this.state.editingCodeList
              ?
              <CodeListsView onClose={() => this.setState({editingCodeList: false})}
                             canSelect={canUpdateCodeList(nodeDef)(survey)}
                             onSelect={codeList => putNodeDefProp(nodeDef, 'codeListUUID', codeList.uuid)}
                             selectedCodeListUUID={getCodeListUUID(nodeDef)}
              />
              : <div className="form">
                <CommonProps {...this.props}
                             toggleCodeListEdit={(editing) => this.setState({editingCodeList: editing})}/>

                <div style={{justifySelf: 'center'}}>
                  <button className="btn btn-of-light"
                          onClick={() => this.close()}>Done
                  </button>
                </div>
              </div>
          }
        </div>
      )
      : null

  }
}

NodeDefEdit.defaultProps = {
  nodeDef: null,
}
const mapStateToProps = state => ({
  survey: getSurvey(state),
  nodeDef: getFormNodeDefEdit(state),
})

export default connect(
  mapStateToProps,
  {closeFormNodeDefEdit, putNodeDefProp, createCodeList}
)(NodeDefEdit)