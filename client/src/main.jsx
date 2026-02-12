import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AppProvider } from './context/AppContext'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <ToastContainer position="top-right" />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
)
