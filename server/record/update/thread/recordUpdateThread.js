const {isMainThread} = require('worker_threads')

const db = require('../../../db/db')

const RecordProcessor = require('./recordProcessor')
const messageTypes = require('./recordThreadMessageTypes')
const Thread = require('../../../threads/thread')

const SurveyManager = require('../../../survey/surveyManager')
const NodeDefManager = require('../../../nodeDef/nodeDefManager')
const SurveyRdbManager = require('../../../surveyRdb/surveyRdbManager')

const Survey = require('../../../../common/survey/survey')
const Node = require('../../../../common/record/node')
const Queue = require('../../../../common/queue')

class RecordUpdateThread extends Thread {

  constructor () {
    super()
    this.queue = new Queue()
    this.processing = false
  }

  async onMessage (msg) {
    this.queue.enqueue(msg)

    await this.processNext()
  }

  async processNext () {
    if (!(this.processing || this.queue.isEmpty())) {

      this.processing = true

      const msg = this.queue.dequeue()
      await this.processMessage(msg)

      this.processing = false

      await this.processNext()
    }
  }

  async processMessage (msg) {
    let nodes = null

    await db.tx(async t => {
      const {user, surveyId} = msg

      switch (msg.type) {
        case messageTypes.createRecord:
          nodes = await RecordProcessor.createRecord(user, surveyId, msg.record, t)
          break
        case messageTypes.persistNode:
          nodes = await RecordProcessor.persistNode(user, surveyId, msg.node, t)
          break
        case messageTypes.deleteNode:
          nodes = await RecordProcessor.deleteNode(user, surveyId, msg.nodeUuid, t)
          break
      }

      if (!isMainThread)
        this.postMessage(nodes)

      const survey = await SurveyManager.fetchSurveyById(surveyId, false, false, t)
      const nodeDefs = await NodeDefManager.fetchNodeDefsByUuid(surveyId, Node.getNodeDefUuids(nodes), false, false, t)
      await SurveyRdbManager.updateTableNodes(Survey.getSurveyInfo(survey), nodeDefs, nodes, t)

    })
  }

}

if (!isMainThread)
  new RecordUpdateThread()

module.exports = {
  newInstance: () => new RecordUpdateThread()
}