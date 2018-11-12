import React from 'react'

import { Input } from '../../../commonComponents/form/input'
import LanguageDropdown from '../../../commonComponents/form/languageDropdown'

import { getFieldValidation } from '../../../../common/validation/validator'
import { normalizeName } from '../../../../common/stringUtils'

const AddSurveyForm = (props) => {

  const {newSurvey, updateNewSurveyProp, createSurvey} = props

  const {name, label, lang, validation} = newSurvey

  return (
    <div style={{
      // gridColumn: '2',

      display: 'grid',
      gridTemplateColumns: 'repeat(4, .25fr)',
      alignItems: 'end',
      gridColumnGap: '2rem',
      padding: '0 10rem',
    }}>
      <div>
        <Input placeholder="Name"
               value={name}
               validation={getFieldValidation('name')(validation)}
               onChange={e => updateNewSurveyProp('name', normalizeName(e.target.value))}/>
      </div>
      <div>
        <Input placeholder="Label"
               value={label}
               validation={getFieldValidation('label')(validation)}
               onChange={e => updateNewSurveyProp('label', e.target.value)}/>
      </div>
      <div>
        <LanguageDropdown placeholder="Language"
                          selection={lang}
                          onChange={e => updateNewSurveyProp('lang', e)}
                          validation={getFieldValidation('lang')(validation)}/>
      </div>
      <button className="btn btn-of-light"
              onClick={() => createSurvey({name, label, lang})}>
        <span className="icon icon-plus icon-left"></span>
        Create Survey
      </button>

    </div>
  )
}

export default AddSurveyForm