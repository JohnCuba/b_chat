import { render } from 'preact'
import { ErrorBoundary, lazy, LocationProvider, Route, Router } from 'preact-iso'

const HomePage = lazy(() => import('./pages/home.page'));

const App = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path='/' component={HomePage} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  )
}

render(<App />, document.getElementById('root')!)