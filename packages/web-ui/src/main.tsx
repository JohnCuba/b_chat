import { render } from 'preact'
import { ErrorBoundary, lazy, LocationProvider, Route, Router } from 'preact-iso'

import './style.css'

export const App = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path='/' component={lazy(() => import('./pages/home'))} />
          <Route path='/chats' component={lazy(() => import('./pages/chats'))} />
          <Route path='/chat/new' component={lazy(() => import('./pages/chat_new'))} />
          <Route path='/chat/:id' component={lazy(() => import('./pages/chat'))} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  )
}

render(<App />, document.getElementById('root')!)
