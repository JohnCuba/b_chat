import { render } from 'preact'
import { ErrorBoundary, lazy, LocationProvider, Route, Router } from 'preact-iso'

import './style.css'

export const App = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path='/' component={lazy(() => import('./pages/home'))} />
          <Route path='/create' component={lazy(() => import('./pages/create-chat'))} />
          <Route path='/join' component={lazy(() => import('./pages/join-chat'))} />
          <Route path='/chat' component={lazy(() => import('./pages/chat'))} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  )
}

render(<App />, document.getElementById('root')!)