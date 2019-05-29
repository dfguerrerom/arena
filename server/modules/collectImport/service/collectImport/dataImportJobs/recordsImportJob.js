const R = require('ramda')

const BatchPersister = require('../../../../../db/batchPersister')

const FileXml = require('../../../../../../common/file/fileXml')
const Queue = require('../../../../../../common/queue')

const Survey = require('../../../../../../common/survey/survey')
const NodeDef = require('../../../../../../common/survey/nodeDef')
const NodeDefValidations = require('../../../../../../common/survey/nodeDefValidations')
const Record = require('../../../../../../common/record/record')
const Node = require('../../../../../../common/record/node')
const RecordValidator = require('../../../../../../common/record/recordValidator')
const Validator = require('../../../../../../common/validation/validator')

const SurveyManager = require('../../../../survey/manager/surveyManager')
const RecordManager = require('../../../../record/manager/recordManager')

const Job = require('../../../../../job/job')

const CollectRecord = require('../model/collectRecord')
const CollectAttributeValueExtractor = require('./collectAttributeValueExtractor')

const CollectSurvey = require('../model/collectSurvey')

class RecordsImportJob extends Job {

  constructor (params) {
    super(RecordsImportJob.type, params)

    this.batchPersister = new BatchPersister(this.nodesBatchInsertHandler.bind(this), 2500)
  }

  async onStart () {
    await super.onStart()
    await RecordManager.disableTriggers(this.getSurveyId(), this.tx)
  }

  async execute (tx) {
    const user = this.getUser()
    const surveyId = this.getSurveyId()
    const survey = await SurveyManager.fetchSurveyAndNodeDefsAndRefDataBySurveyId(surveyId, true, true, false, tx)

    const entryNames = this.getEntryNames()

    this.total = entryNames.length

    for (const entryName of entryNames) {
      if (this.isCanceled())
        break

      // this.logDebug(`-- start import record ${entryName}`)

      // this.logDebug(`${entryName} findCollectRecordData start`)
      const collectRecordData = this.findCollectRecordData(entryName)
      const { collectRecordXml, step } = collectRecordData
      // this.logDebug(`${entryName} findCollectRecordData done`)

      // this.logDebug(`${entryName} parseToJson start`)
      const collectRecordJson = FileXml.parseToJson(collectRecordXml)
      // this.logDebug(`${entryName} parseToJson done`)

      // this.logDebug(`${entryName} recordToCreate start`)
      const recordToCreate = Record.newRecord(user)
      const record = await RecordManager.insertRecord(surveyId, recordToCreate, tx)
      const recordUuid = Record.getUuid(record)
      await RecordManager.updateRecordStep(surveyId, recordUuid, step, tx)
      // this.logDebug(`${entryName} recordToCreate end`)

      // this.logDebug(`${entryName} traverseCollectRecordAndInsertNodes start`)
      const recordValidation = await this.traverseCollectRecordAndInsertNodes(survey, record, collectRecordJson)
      // this.logDebug(`${entryName} traverseCollectRecordAndInsertNodes end`)

      //flush batch persister, nodes could be still being inserted
      await this.batchPersister.flush(this.tx)

      /*
      const { root } = Survey.getHierarchy()(survey)
      await Survey.traverseHierarchyItem(root, async nodeDefEntity => {
        const nodeDefKeys = Survey.getNodeDefKeys(nodeDefEntity)(survey)
        if (!R.isEmpty(nodeDefKeys)) {
          const nodeDefKeyUuids = nodeDefKeys.map(NodeDef.getUuid)
          const nodeKeyDuplicateUuids = await RecordManager.fetchDuplicateEntityKeyNodeUuids(surveyId, recordUuid, NodeDef.getUuid(nodeDefEntity), nodeDefKeyUuids, this.tx)
          if (!R.isEmpty) {
            this.logDebug('=====DUPLICATES', nodeKeyDuplicateUuids)
          }
        }
      })
      */

      //persist validation
      // this.logDebug(`${entryName} persistValidation start`)
      await RecordManager.persistValidation(survey, record, recordValidation, this.tx)
      // this.logDebug(`${entryName} persistValidation end`)

      // this.logDebug(`-- end import record ${entryName}`)

      this.incrementProcessedItems()
    }
  }

  async beforeSuccess () {
    await this.batchPersister.flush(this.tx)
  }

  async beforeEnd () {
    await super.beforeEnd()
    await RecordManager.enableTriggers(this.getSurveyId(), this.tx)
  }

  getEntryNames () {
    const { collectSurveyFileZip } = this.context

    const steps = [1, 2, 3]

    for (const step of steps) {
      const entryNames = collectSurveyFileZip.getEntryNames(`data/${step}/`)
      if (!R.isEmpty(entryNames))
        return entryNames
    }
    return []
  }

  findCollectRecordData (entryName) {
    const { collectSurveyFileZip } = this.context

    const steps = [3, 2, 1]

    for (const step of steps) {
      const collectRecordXml = collectSurveyFileZip.getEntryAsText(`data/${step}/${entryName}`)
      if (collectRecordXml) {
        return { collectRecordXml, step }
      }
    }

    throw new Error(`Entry data not found: ${entryName}`)
  }

  async traverseCollectRecordAndInsertNodes (survey, record, collectRecordJson) {
    const { nodeDefUuidByCollectPath, collectSurveyFileZip, collectSurvey } = this.context

    const collectRootEntityName = R.pipe(
      R.keys,
      R.reject(R.equals('_declaration')),
      R.head,
    )(collectRecordJson)

    const collectRootEntity = collectRecordJson[collectRootEntityName]

    const recordUuid = Record.getUuid(record)
    let recordValidation = Record.getValidation(record)

    const collectRootEntityDefPath = `/${collectRootEntityName}`
    const collectRootEntityDef = CollectSurvey.getNodeDefByPath(collectRootEntityDefPath)(collectSurvey)

    const queue = new Queue([{
      nodeParent: null,
      collectNodeDef: collectRootEntityDef,
      collectNodeDefPath: collectRootEntityDefPath,
      collectNode: collectRootEntity
    }])

    while (!queue.isEmpty()) {

      const item = queue.dequeue()
      const { nodeParent, collectNodeDef, collectNodeDefPath, collectNode } = item

      const nodeDefUuid = nodeDefUuidByCollectPath[collectNodeDefPath]
      const nodeDef = Survey.getNodeDefByUuid(nodeDefUuid)(survey)

      let nodeToInsert = Node.newNode(nodeDefUuid, recordUuid, nodeParent)

      const valueAndMeta = NodeDef.isAttribute(nodeDef)
        ? await CollectAttributeValueExtractor.extractAttributeValueAndMeta(
          survey, nodeDef, record, nodeToInsert,
          collectSurveyFileZip, collectSurvey, collectNodeDef, collectNode,
          this.tx
        )
        : null

      const value = R.propOr(null, 'value', valueAndMeta)
      const meta = R.propOr({}, 'meta', valueAndMeta)

      nodeToInsert = Node.assocValue(value)(nodeToInsert)
      nodeToInsert = Node.assocMeta(meta)(nodeToInsert)

      await this._insertNode(nodeDef, nodeToInsert)

      if (NodeDef.isEntity(nodeDef)) {

        // create child nodes to insert
        const { nodesToInsert, validation } = this._createNodeChildrenToInsert(survey, collectNodeDef, collectNodeDefPath, collectNode, nodeToInsert, recordValidation)
        recordValidation = validation
        queue.enqueueItems(nodesToInsert)

      } else {
        const validationAttribute = RecordValidator.validateAttribute(nodeToInsert)
        if (!Validator.isValidationValid(validationAttribute)) {
          recordValidation[Validator.keys.valid] = false
          recordValidation[Validator.keys.fields][Node.getUuid(nodeToInsert)] = validationAttribute
        }
      }
    }

    return recordValidation

  }

  _createNodeChildrenToInsert (survey, collectNodeDef, collectNodeDefPath, collectNode, node, recordValidation) {
    const { nodeDefUuidByCollectPath } = this.context

    //output
    const nodesToInsert = []

    const nodeUuid = Node.getUuid(node)
    let nodeValidation = Validator.getFieldValidation(nodeUuid)(recordValidation)

    const collectNodeDefChildren = CollectSurvey.getNodeDefChildren(collectNodeDef)
    for (const collectNodeDefChild of collectNodeDefChildren) {
      if (this.isCanceled())
        break

      const collectNodeDefChildName = CollectSurvey.getAttributeName(collectNodeDefChild)
      const collectNodeDefChildPath = collectNodeDefPath + '/' + collectNodeDefChildName
      const nodeDefChildUuid = nodeDefUuidByCollectPath[collectNodeDefChildPath]

      if (nodeDefChildUuid) {
        const nodeDefChild = Survey.getNodeDefByUuid(nodeDefChildUuid)(survey)
        const collectChildNodes = CollectRecord.getNodeChildren([collectNodeDefChildName])(collectNode)

        const childrenCount = collectChildNodes.length

        // if children count > 0
        for (const collectChildNode of collectChildNodes) {
          if (this.isCanceled())
            break

          nodesToInsert.push({
            nodeParent: node,
            collectNodeDef: collectNodeDefChild,
            collectNodeDefPath: collectNodeDefChildPath,
            collectNode: collectChildNode
          })
        }

        //validate min/max count
        if (NodeDefValidations.hasMinOrMaxCount(NodeDef.getValidations(nodeDefChild))) {
          const validationCount = RecordValidator.validateChildrenCount(survey, node, nodeDefChild, childrenCount)

          if (!Validator.isValidationValid(validationCount)) {
            recordValidation[Validator.keys.valid] = false
            nodeValidation = R.mergeDeepRight(nodeValidation, validationCount)
            recordValidation[Validator.keys.fields][nodeUuid] = nodeValidation
          }

        }

        if (NodeDef.isSingle(nodeDefChild) && childrenCount === 0) {
          nodesToInsert.push({
            nodeParent: node,
            collectNodeDef: collectNodeDefChild,
            collectNodeDefPath: collectNodeDefChildPath,
            collectNode: {}
          })
        }

      } else {
        this.logDebug(`==== NodeDef not found for ${collectNodeDefChildPath}`)
      }
    }

    return {
      nodesToInsert,
      recordValidation
    }
  }

  async _insertNode (nodeDef, node) {
    node.dateCreated = new Date()
    const value = Node.getValue(node, null)

    const nodeValueInsert = [
      Node.getUuid(node),
      node.dateCreated,
      node.dateCreated,
      Node.getRecordUuid(node),
      Node.getParentUuid(node),
      NodeDef.getUuid(nodeDef),
      value === null || (NodeDef.isCode(nodeDef) || NodeDef.isTaxon(nodeDef) || NodeDef.isCoordinate(nodeDef) || NodeDef.isFile(nodeDef))
        ? value
        : JSON.stringify(value),
      {
        ...Node.getMeta(node),
        [Node.metaKeys.childApplicability]: {}
      }
    ]

    await this.batchPersister.addItem(nodeValueInsert, this.tx)
  }

  async nodesBatchInsertHandler (nodeValues, tx) {
    const surveyId = this.getSurveyId()
    await RecordManager.insertNodesFromValues(surveyId, nodeValues, tx)
  }

}

RecordsImportJob.type = 'RecordsImportJob'

module.exports = RecordsImportJob