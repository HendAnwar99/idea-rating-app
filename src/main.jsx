import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { VotesProvider } from './context/VotesContext.jsx'
import { IdeasProvider } from './context/IdeasContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <IdeasProvider>
        <VotesProvider>
          <App />
        </VotesProvider>
      </IdeasProvider>
    </BrowserRouter>
  </StrictMode>,
)
