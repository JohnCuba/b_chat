import { AppContext, appContextValue } from "../hooks/use_app_context.hook"
import { AppRouter } from "./router"

export const App = () => {
  return (
    <AppContext.Provider value={appContextValue}>
      <AppRouter />
    </AppContext.Provider>
  )
}