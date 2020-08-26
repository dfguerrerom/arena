import { button, click, clickParent, expectExists, writeIntoTextBox } from '../utils/api'
import { clickHeaderBtnCreateSurvey, clickHeaderBtnMySurveys, waitForLoader } from '../utils/ui'

const createSurvey = async ({ name, label }) => {
  await writeIntoTextBox({ text: name, selector: { placeholder: 'Name' } })
  await writeIntoTextBox({ text: label, selector: { placeholder: 'Label' } })
  await click(button('Create Survey'))
  await waitForLoader()
}

const verifyHomeDashboard = async ({ label }) => {
  await expectExists({ selector: '.home-dashboard' })
  await expectExists({ text: label })
}

const createAndVerifySurvey = async ({ name, label }) => {
  await clickHeaderBtnCreateSurvey()
  await createSurvey({ name, label })
  await verifyHomeDashboard({ label })
}

describe('Survey create', () => {
  test('Create a survey with name "survey_1" and label "Survey 1"', async () => {
    await createAndVerifySurvey({ name: 'survey_1', label: 'Survey 1' })
  })

  test('Create a survey with name "survey_2" and label "Survey 2"', async () => {
    await createAndVerifySurvey({ name: 'survey_2', label: 'Survey 2' })
  })

  test('Navigate to "My Surveys" and select survey_1', async () => {
    await clickHeaderBtnMySurveys()

    await expectExists({ selector: '.table' })
    await expectExists({ text: 'survey_1' })
    await expectExists({ text: 'survey_2' })

    await clickParent('survey_1')

    await verifyHomeDashboard({ label: 'Survey 1' })
  })
})