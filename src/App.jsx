import { BrowserRouter } from 'react-router-dom'
import './App.css'
import AppRouter from './config/Router.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
