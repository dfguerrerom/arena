import React from 'react'
import * as R from 'ramda'

import UploadButton from '../../../../commonComponents/form/uploadButton'
import DownloadButton from '../../../../commonComponents/form/downloadButton'
import NodeDefDeleteButton from '../nodeDefDeleteButton'
import { FormItem } from '../../../../commonComponents/form/input'

import { elementOffset } from '../../../../appUtils/domUtils'

import { getNodeValue, getNodeFileName } from '../../../../../common/record/node'
import { nodeDefRenderType } from '../../../../../common/survey/nodeDefLayout'

const getFileExtension = R.pipe(
  getNodeFileName,
  R.split('.'),
  R.tail,
)

const getFileName = node => R.pipe(
  getNodeFileName,
  fileName => R.slice(0, fileName.lastIndexOf('.'))(fileName),
  fileName => fileName.length > 15
    ? R.slice(0, 15, fileName) + '..'
    : fileName,
  fileName => R.isEmpty(fileName)
    ? ''
    : fileName + '.' + getFileExtension(node)
)(node)

const NodeDefFileInput = ({surveyInfo, nodeDef, edit, recordId, node, updateNode, removeNode}) =>
  node
    ? <div className="node-def__file-input">
      <UploadButton disabled={edit}
                    showLabel={false}
                    onChange={files => updateNode(nodeDef, node, {fileName: files[0].name}, files[0])}/>

      <DownloadButton href={`/api/survey/${surveyInfo.id}/record/${recordId}/nodes/${node.uuid}/file`}
                      disabled={edit || R.isEmpty(getNodeValue(node))}
                      label={getFileName(node)}/>

      <NodeDefDeleteButton nodeDef={nodeDef}
                           node={node}
                           disabled={edit || R.isEmpty(getNodeValue(node))}
                           showConfirm={true}
                           removeNode={removeNode}/>
    </div>
    : null

const NodeDefFile = props => {
  const {nodeDef, edit, nodes, renderType, label} = props

  // table header
  if (renderType === nodeDefRenderType.tableHeader) {
    return <label className="node-def__table-header">
      {label}
    </label>
  }

  // EDIT MODE

  if (edit)
    return <FormItem label={label}>
      <NodeDefFileInput {...props} />
    </FormItem>

  // ENTRY MODE

  if (renderType === nodeDefRenderType.tableBody) {
    return <NodeDefFileInput {...props} node={nodes[0]}/>
  } else {
    const domElem = document.getElementById(nodeDef.uuid)
    const {height} = domElem ? elementOffset(domElem) : {height: 80}

    return (
      <FormItem label={label}>
        <div className="overflowYAuto" style={{maxHeight: height}}>
          {
            nodes.map((n, i) =>
              <NodeDefFileInput key={i} {...props} node={n}/>
            )
          }
        </div>
      </FormItem>
    )
  }
}

export default NodeDefFile