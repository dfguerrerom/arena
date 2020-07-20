import axios from 'axios'

export const fetchCategories = async ({ surveyId, draft = true, validate = false, search = '' }) => {
  const {
    data: { list: categories },
  } = await axios.get(`/api/survey/${surveyId}/categories`, {
    params: { draft, validate, search },
  })
  return categories
}

export const fetchCategory = async ({ surveyId, categoryUuid, draft = true, validate = true }) => {
  const {
    data: { category },
  } = await axios.get(`/api/survey/${surveyId}/categories/${categoryUuid}`, {
    params: {
      draft,
      validate,
    },
  })
  return category
}