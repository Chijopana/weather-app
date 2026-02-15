/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-white relative font-sans">
          <div className="fixed inset-0 -z-10 bg-gradient-to-b from-red-600 via-red-500 to-red-700" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-center"
          >
            <FiAlertTriangle size={48} className="mx-auto mb-4 text-red-300" />
            <h1 className="text-2xl font-bold mb-3">Algo salió mal</h1>
            <p className="text-white/80 mb-6">
              No pudimos cargar la aplicación correctamente. Intenta recargar la página.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left text-xs text-white/60 bg-black/20 p-4 rounded-lg">
                <summary className="cursor-pointer font-semibold mb-2">Detalles del error (dev)</summary>
                <pre className="overflow-auto">{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
            >
              Recargar página
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
