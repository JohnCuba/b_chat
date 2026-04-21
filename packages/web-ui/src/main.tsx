import { render } from 'preact'
import { ErrorBoundary, lazy, LocationProvider, Route, Router } from 'preact-iso'

import './global.css'

export const App = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path='/' component={lazy(() => import('./pages/home.page'))} />
          <Route path='/create' component={lazy(() => import('./pages/create_chat.page'))} />
          <Route path='/join' component={lazy(() => import('./pages/join_chat.page'))} />
          <Route path='/chat' component={lazy(() => import('./pages/chat.page'))} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  )
}

render(<App />, document.getElementById('root')!)