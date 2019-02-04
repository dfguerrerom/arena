import React from 'react'
import { Route, Switch } from 'react-router'

import DesignerView from '../../designer/designerView'
import HomeView from '../../home/appHomeView'
import DashboardView from '../../dashboard/dashboardView'
import DataView from '../../data/dataView'

import { appModules, appModuleUri } from '../../appModules'

const AppModuleHOC = Component => props => (
  <div className="app-module">
    <Component {...props}/>
  </div>
)
const Home = AppModuleHOC(HomeView)
const Dashboard = AppModuleHOC(DashboardView)
const Designer = AppModuleHOC(DesignerView)
const Data = AppModuleHOC(DataView)

const AppModuleSwitch = (props) => (
  <div className="app__modules">

    <Switch location={props.location}>
      <Route path={appModuleUri(appModules.home)} component={Home}/>
      <Route path={appModuleUri(appModules.dashboard)} component={Dashboard}/>
      <Route path={appModuleUri(appModules.designer)} component={Designer}/>
      <Route path={appModuleUri(appModules.data)} component={Data}/>
    </Switch>

  </div>
)

export default AppModuleSwitch