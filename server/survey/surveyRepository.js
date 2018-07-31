const R = require('ramda')

const db = require('../db/db')
const camelize = require('camelize')

const {uuidv4} = require('../../common/uuid')

const {setUserPref} = require('../user/userRepository')
const {userPrefNames} = require('../user/userPrefs')

const {createEntityDef, dbTransformCallback} = require('../nodeDef/nodeDefRepository')

// ============== CREATE

const createSurvey = async (user, {name, label, lang}) => db.tx(
  async t => {
    const props = {name, labels: {[lang]: label}, languages: [lang]}

    const {id: surveyId} = await t.one(`
      INSERT INTO survey (owner_id, props_draft)
      VALUES ($1, $2)
      RETURNING id
    `, [user.id, props])

    const {id: rootNodeDefId} = await createEntityDef(surveyId, null, {name: 'root_entity', label: 'Root entity'}, t)

    await t.any(`UPDATE survey SET root_node_def_id = $1 WHERE id = $2`, [rootNodeDefId, surveyId])

    // update user prefs
    await setUserPref(user, userPrefNames.survey, surveyId, t)

    return await getSurveyById(surveyId, true, t)
  }
)

// ============== READ
const getSurveyById = async (surveyId, draft = false, client = db) => await client.one(
  `SELECT * FROM survey WHERE id = $1`,
  [surveyId],
  def => dbTransformCallback(def, draft)
)

const getSurveyByName = async (surveyName, client = db) => await client.oneOrNone(
  `SELECT * FROM survey WHERE props->>'name' = $1 OR props_draft->>'name' = $1`,
  [surveyName],
  def => dbTransformCallback(def)
)

// ============== UPDATE

// ============== DELETE

module.exports = {
  // CREATE
  createSurvey,

  // READ
  getSurveyById,
  getSurveyByName,
}
