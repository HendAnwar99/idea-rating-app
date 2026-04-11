import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { VotesProvider } from './context/VotesContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <VotesProvider>
        <App />
      </VotesProvider>
    </BrowserRouter>
  </StrictMode>,
)
