import React from 'react'
import ReactDOM from 'react-dom'
import * as R from 'ramda'
import axios from 'axios'
import Promise from 'bluebird'

import NodeDefMultipleEditDialog from './nodeDefMultipleEditDialog'

import Survey from '../../../../../common/survey/survey'
import NodeDef from '../../../../../common/survey/nodeDef'
import Category from '../../../../../common/survey/category'
import Node from '../../../../../common/record/node'

import { getNodeDefComponent } from '../nodeDefSystemProps'

const getNodeValues = async (surveyInfo, nodeDef, nodes) => {
  const nonEmptyNodes = R.pipe(
    R.reject(Node.isPlaceholder),
    R.reject(Node.isNodeValueBlank),
  )(nodes)

  const stringNodeValues = await Promise.all(
    nonEmptyNodes.map(
      async node =>
        NodeDef.isNodeDefCode(nodeDef)
          ? await loadCategoryItemLabel(surveyInfo, Node.getCategoryItemUuid(node))
          : NodeDef.isNodeDefFile(nodeDef)
          ? Node.getNodeFileName(node)
          : Node.getNodeValue(node)
    )
  )

  return R.join(', ', stringNodeValues)
}

const loadCategoryItemLabel = async (surveyInfo, itemUuid) => {
  const { data } = await axios.get(`/api/survey/${surveyInfo.id}/categories/items/${itemUuid}`)
  return Category.getItemLabel(Survey.getDefaultLanguage(surveyInfo))(data.item)
}

class NodeDefMultipleTableBody extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      showEditDialog: false,
      nodeValues: '',
    }
  }

  async componentDidMount () {
    await this.loadNodeValues()
  }

  async componentDidUpdate (prevProps) {
    const { nodes: prevNodes } = prevProps

    if (!R.equals(prevNodes, this.props.nodes)) {
      await this.loadNodeValues()
    }
  }

  async loadNodeValues () {
    const { surveyInfo, nodeDef, nodes } = this.props
    const nodeValues = await getNodeValues(surveyInfo, nodeDef, nodes)

    this.setState({ nodeValues })
  }

  setShowEditDialog (showEditDialog) {
    this.setState({ showEditDialog })
  }

  render () {
    const { canEditRecord } = this.props

    return this.state.showEditDialog
      ? (
        ReactDOM.createPortal(
          <NodeDefMultipleEditDialog {...this.props}
                                     onClose={() => this.setShowEditDialog(false)}/>,
          document.body
        )
      )
      : (
        <div className="node-def__text-multiple-table-cell">
          <span className="values-summary">{this.state.nodeValues}</span>
          <button className="btn-s btn-of-light-xs"
                  onClick={() => this.setShowEditDialog(true)}>
            <span className={`icon icon-12px ${canEditRecord ? 'icon-pencil2' : 'icon-eye'}`}/>
          </button>
        </div>
      )
  }
}

const NodeDefTableBody = props => {
  const { nodeDef } = props

  return (
    NodeDef.isNodeDefMultiple(nodeDef) || NodeDef.isNodeDefCode(nodeDef)
      ? <NodeDefMultipleTableBody {...props}/>
      : React.createElement(getNodeDefComponent(nodeDef), { ...props })
  )
}

export default NodeDefTableBody