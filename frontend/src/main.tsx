import React from 'react'
import ReactDOM from 'react-dom/client'
import { SWRConfig } from 'swr'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import { api } from './lib/api-client'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SWRConfig 
      value={{
        fetcher: (url: string) => api.get(url),
        revalidateOnFocus: false,
        shouldRetryOnError: false
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </SWRConfig>
  </React.StrictMode>,
)
