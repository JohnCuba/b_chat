import { LocationProvider, Router, Route, lazy, ErrorBoundary } from 'preact-iso';
import { AppLayout } from '../components/app_layout';

const ChatRouter = () => {
  return (
    <AppLayout>
      <Router>
        <Route path="/list" component={lazy(() => import('../pages/chats'))} />
        <Route path="/new" component={lazy(() => import('../pages/chat_new'))} />
        <Route path="/:id" component={lazy(() => import('../pages/chat'))} />
      </Router>
    </AppLayout>
  );
}

export const AppRouter = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path="/" component={lazy(() => import('../pages/home'))} />
          <Route path="/chat/*" component={ChatRouter} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
};