const {sendErr} = require('../serverUtils/response')

const {getRestParam, getBoolParam} = require('../serverUtils/request')

const {toUuidIndexedObj} = require('../../common/survey/surveyUtils')
const {requireSurveyEditPermission} = require('../authGroup/authMiddleware')

const CategoryManager = require('./categoryManager')

const sendValidatedCategory = async (surveyId, categoryId, res, rest = {}) => {
  const category = await CategoryManager.fetchCategoryById(surveyId, categoryId, true, true)
  res.json({category, ...rest})
}

const sendCategories = async (res, surveyId, draft, validate) => {
  const categories = await CategoryManager.fetchCategoriesBySurveyId(surveyId, draft, validate)
  res.json({categories: toUuidIndexedObj(categories)})
}

module.exports.init = app => {

  // ==== CREATE
  app.post('/survey/:surveyId/categories', requireSurveyEditPermission, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')

      const {body, user} = req

      const category = await CategoryManager.insertCategory(user, surveyId, body)

      res.json({category})
    } catch (err) {
      sendErr(res, err)
    }
  })

  app.post('/survey/:surveyId/categories/:categoryId/levels', requireSurveyEditPermission, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')
      const categoryId = getRestParam(req, 'categoryId')
      const {body, user} = req

      await CategoryManager.insertLevel(user, surveyId, categoryId, body)

      await sendValidatedCategory(surveyId, categoryId, res)
    } catch (err) {
      sendErr(res, err)
    }
  })

  app.post('/survey/:surveyId/categories/:categoryId/items', requireSurveyEditPermission, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')
      const categoryId = getRestParam(req, 'categoryId')

      const {body, user} = req

      const item = await CategoryManager.insertItem(user, surveyId, body)

      await sendValidatedCategory(surveyId, categoryId, res, {item})
    } catch (err) {
      sendErr(res, err)
    }
  })

  // ==== READ

  app.get(`/survey/:surveyId/categories`, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')
      const draft = getBoolParam(req, 'draft')
      const validate = getBoolParam(req, 'validate')

      await sendCategories(res, surveyId, draft, validate)
    } catch (err) {
      sendErr(res, err)
    }
  })

  // fetch items by parent item Uuid
  app.get('/survey/:surveyId/categories/:categoryId/items', async (req, res) => {
    try {
      const draft = getBoolParam(req, 'draft')
      const surveyId = getRestParam(req, 'surveyId')
      const categoryId = getRestParam(req, 'categoryId')
      const parentUuid = getRestParam(req, 'parentUuid')

      const items = await CategoryManager.fetchItemsByParentUuid(surveyId, categoryId, parentUuid, draft)

      res.json({items})
    } catch (err) {
      sendErr(res, err)
    }
  })

  app.get('/survey/:surveyId/categories/items/:itemUuid', async (req, res) => {
    try {
      const draft = getBoolParam(req, 'draft')
      const surveyId = getRestParam(req, 'surveyId')
      const itemUuid = getRestParam(req, 'itemUuid')

      const item = await CategoryManager.fetchItemByUuid(surveyId, itemUuid, draft)

      res.json({item})
    } catch (err) {
      sendErr(res, err)
    }
  })

  // ==== UPDATE

  app.put('/survey/:surveyId/categories/:categoryUuid', requireSurveyEditPermission, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')
      const categoryUuid = getRestParam(req, 'categoryUuid')
      const {body, user} = req
      const {key, value} = body

      await CategoryManager.updateCategoryProp(user, surveyId, categoryUuid, key, value)

      await sendCategories(res, surveyId, true, true)
    } catch (err) {
      sendErr(res, err)
    }
  })

  app.put('/survey/:surveyId/categories/:categoryId/levels/:levelUuid', requireSurveyEditPermission, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')
      const categoryId = getRestParam(req, 'categoryId')
      const levelUuid = getRestParam(req, 'levelUuid')
      const {body, user} = req
      const {key, value} = body

      await CategoryManager.updateLevelProp(user, surveyId, levelUuid, key, value)

      await sendValidatedCategory(surveyId, categoryId, res)
    } catch (err) {
      sendErr(res, err)
    }
  })

  app.put('/survey/:surveyId/categories/:categoryId/items/:itemUuid', requireSurveyEditPermission, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')
      const categoryId = getRestParam(req, 'categoryId')
      const itemUuid = getRestParam(req, 'itemUuid')
      const {body, user} = req
      const {key, value} = body

      await CategoryManager.updateItemProp(user, surveyId, itemUuid, key, value)

      await sendValidatedCategory(surveyId, categoryId, res)
    } catch (err) {
      sendErr(res, err)
    }
  })

  // ==== DELETE

  app.delete('/survey/:surveyId/categories/:categoryUuid', requireSurveyEditPermission, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')
      const categoryUuid = getRestParam(req, 'categoryId')
      const {user} = req

      await CategoryManager.deleteCategory(user, surveyId, categoryUuid)

      await sendCategories(res, surveyId, true, true)
    } catch (err) {
      sendErr(res, err)
    }
  })

  app.delete('/survey/:surveyId/categories/:categoryId/levels/:levelUuid', requireSurveyEditPermission, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')
      const categoryId = getRestParam(req, 'categoryId')
      const levelUuid = getRestParam(req, 'levelUuid')
      const {user} = req

      await CategoryManager.deleteLevel(user, surveyId, levelUuid)

      await sendValidatedCategory(surveyId, categoryId, res)
    } catch (err) {
      sendErr(res, err)
    }
  })

  app.delete('/survey/:surveyId/categories/:categoryId/items/:itemUuid', requireSurveyEditPermission, async (req, res) => {
    try {
      const surveyId = getRestParam(req, 'surveyId')
      const categoryId = getRestParam(req, 'categoryId')
      const itemUuid = getRestParam(req, 'itemUuid')
      const {user} = req

      await CategoryManager.deleteItem(user, surveyId, itemUuid)

      await sendValidatedCategory(surveyId, categoryId, res)
    } catch (err) {
      sendErr(res, err)
    }
  })

}