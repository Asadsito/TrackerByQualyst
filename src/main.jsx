import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          fontFamily: 'system-ui', 
          maxWidth: '600px', 
          margin: '50px auto',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px'
        }}>
          <h1 style={{ color: '#c00', marginTop: 0 }}>Something went wrong</h1>
          <p style={{ color: '#666' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>Error details</summary>
            <pre style={{ 
              background: '#fff', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
