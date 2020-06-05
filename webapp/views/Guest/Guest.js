import './Guest.scss'
import React from 'react'
import { Route, Switch } from 'react-router'

import { guestModules } from '@webapp/app/appModules'
import ResetPasswordView from '@webapp/views/Guest/views/ResetPassword'
import ForgotPassword from '@webapp/views/Guest/views/ForgotPassword'
import Login from '@webapp/views/Guest/views/Login'

const WordSplitter = ({ word }) => word.split('').map((letter, i) => <div key={String(i)}>{letter}</div>)

const Guest = () => (
  <>
    <div className="guest__bg" />

    <div className="guest__openforis">
      <div className="openforis">
        <WordSplitter word="open" />
        <div className="separator">∞</div>
        <WordSplitter word="foris" />
      </div>
      <div className="arena">
        <WordSplitter word="arena" />
      </div>
    </div>

    <form onSubmit={(event) => event.preventDefault()} className="guest__form">
      <Switch>
        <Route path={guestModules.resetPassword.path} exact component={ResetPasswordView} />
        <Route path={guestModules.forgotPassword.path} exact component={ForgotPassword} />
        <Route>
          <Login />
        </Route>
      </Switch>
    </form>
  </>
)

export default Guest
