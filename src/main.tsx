import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ToastProvider'
import { checkAndClearStaleCache } from './utils/cacheBusting'
import App from './App'

// Check and clear stale cache on app startup (especially important for mobile)
checkAndClearStaleCache().catch(error => console.error('Cache busting error:', error));

const updateViewportHeight = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}

updateViewportHeight()
window.addEventListener('resize', updateViewportHeight)
window.addEventListener('orientationchange', updateViewportHeight)

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found in HTML')
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)

