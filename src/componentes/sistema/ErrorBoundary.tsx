import React, { Component, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 24px', textAlign: 'center',
          minHeight: '200px', gap: '12px'
        }}>
          <span style={{ fontSize: '48px' }}>⚠️</span>
          <h3 style={{ color: '#1a1a2e', margin: 0, fontSize: '18px' }}>Algo salió mal</h3>
          <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
            {this.state.error?.message || 'Error inesperado. Recarga la página.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#e94560', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600
            }}
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
