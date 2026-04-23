import { render } from 'preact'
import { ErrorBoundary, lazy, LocationProvider, Route, Router } from 'preact-iso'

import './style.css'

export const App = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path='/' component={lazy(() => import('./pages/home'))} />
          <Route path='/start' component={lazy(() => import('./pages/start'))} />
          <Route path='/chat' component={lazy(() => import('./pages/chat'))} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  )
}

render(<App />, document.getElementById('root')!)