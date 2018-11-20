const R = require('ramda')

const SurveyPublishJob = require('../survey/publish/surveyPublishJob')
const NodeDefsValidationJob = require('../survey/publish/nodeDefsValidationJob')
const CodeListsValidationJob = require('../survey/publish/codeListsValidationJob')
const SurveyInfoValidationJob = require('../survey/publish/surveyInfoValidationJob')
const SurveyPropsPublishJob = require('../survey/publish/surveyPropsPublishJob')
const TaxonomiesValidationJob = require('../survey/publish/taxonomiesValidationJob')

const TaxonomyImportJob = require('../taxonomy/taxonomyImportJob')

const jobClasses = [
  SurveyPublishJob,
  NodeDefsValidationJob,
  CodeListsValidationJob,
  SurveyInfoValidationJob,
  SurveyPropsPublishJob,
  TaxonomiesValidationJob,
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