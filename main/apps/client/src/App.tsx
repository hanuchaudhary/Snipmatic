import { BrowserRouter } from "react-router"

import { Provider } from "./components/provider/provider"
import { Router } from "./pages/router"

export const App = () => {
  return (
    <Provider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </Provider>
  )
}