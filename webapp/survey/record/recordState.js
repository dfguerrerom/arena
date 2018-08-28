import * as R from 'ramda'
import { deleteNodeAndChildren, updateNodes } from '../../../common/record/record'

/**
 * ======================
 * Record
 * ======================
 */
const record = 'record'

export const getRecord = R.prop(record)

// export const updateRecordNodes = updatedNodes =>
//   R.pipe(
//     getRecord,
//     updateNodes(updatedNodes),
//     assocRecord,
//   )
//
// export const deleteRecordNodeAndChildren = node =>
//   R.pipe(
//     getRecord,
//     deleteNodeAndChildren(node),
//     assocRecord,
//   )