const R = require('ramda')

const SurveyPublishJob = require('../modules/survey/service/publish/surveyPublishJob')
const CollectImportJob = require('../modules/collectImport/service/collectImport/collectImportJob')
const TaxonomyImportJob = require('../modules/taxonomy/service/taxonomyImportJob')

const jobClasses = [
  SurveyPublishJob,
  CollectImportJob,
  TaxonomyImportJob,
]

const getJobClass = jobType => R.find(R.propEq('type', jobType), jobClasses)

const createJob = (jobType, params) => {
  const jobClass = getJobClass(jobType)

  return new jobClass(params)
}


module.exports = {
  createJob,
}