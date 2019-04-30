import React from 'react'
import { uuidv4 } from '../../../../../../../common/uuid'

import UploadButton from '../../../../../../commonComponents/form/uploadButton'
import DownloadButton from '../../../../../../commonComponents/form/downloadButton'
import NodeDeleteButton from '../nodeDeleteButton'

import NodeDef from '../../../../../../../common/survey/nodeDef'
import Node from '../../../../../../../common/record/node'
import RecordFile from '../../../../../../../common/record/recordFile'

const handleFileChange = (nodeDef, node, file, updateNode) => {
  const value = {
    [Node.valuePropKeys.fileUuid]: uuidv4(),
    [Node.valuePropKeys.fileName]: file.name,
    [Node.valuePropKeys.fileSize]: file.size
  }
  updateNode(nodeDef, node, value, file)
}

const handleNodeDelete = (nodeDef, node, removeNode, updateNode) => {
  if (NodeDef.isMultiple(nodeDef)) {
    removeNode(nodeDef, node)
  } else {
    // do not delete single node, delete only its value
    updateNode(nodeDef, node, null)
  }
}

const FileInput = ({ surveyInfo, nodeDef, readOnly, edit, node, canEditRecord, updateNode, removeNode }) => {
  const fileName = Node.getFileName(node)
  const truncatedFileName = RecordFile.truncateFileName(fileName)
  const fileUploaded = !edit && fileName

  return <div className="node-def__file-input">
    <UploadButton disabled={edit || !canEditRecord || readOnly}
                  showLabel={false}
                  onChange={files => handleFileChange(nodeDef, node, files[0], updateNode)}/>

    <DownloadButton
      href={edit ? null : `/api/survey/${surveyInfo.id}/record/${Node.getRecordUuid(node)}/nodes/${Node.getUuid(node)}/file`}
      disabled={!fileUploaded}
      label={truncatedFileName}
      title={fileName === truncatedFileName ? null : fileName}/>

    <NodeDeleteButton nodeDef={nodeDef}
                      node={node}
                      disabled={!fileUploaded}
                      showConfirm={true}
                      removeNode={(nodeDef, node) => handleNodeDelete(nodeDef, node, removeNode, updateNode)}/>
  </div>
}

const MultipleFileInput = props => {
  const { nodes } = props

  return <div className="node-def__entry-multiple">
    <div className="nodes">
      {
        nodes.map((n, i) =>
          <FileInput key={i}
                     {...props}
                     node={n}/>
        )
      }
    </div>
  </div>
}

const NodeDefFile = props =>
  props.edit
    ? <FileInput {...props}/>
    : <MultipleFileInput {...props}/>

export default NodeDefFile