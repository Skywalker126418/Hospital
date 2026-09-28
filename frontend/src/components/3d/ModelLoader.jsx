import React, { Component } from 'react';
import { Loader2, AlertCircle, RefreshCw, Box } from 'lucide-react';
import Button from '../common/Button';

/**
 * Robust Error Boundary & Fallback System for 3D WebGL Canvases
 * Ensures the application NEVER crashes if WebGL or shaders fail!
 */
export class Model3DErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[3D Engine Notice] WebGL rendering encountered an issue:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400 mb-3 border border-slate-700">
            <Box className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">3D Medical Visualization Unavailable</h4>
          <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
            WebGL acceleration is restricted on this client device. Fallback diagrammatic inspection mode is active.
          </p>
          <Button variant="outline" size="sm" onClick={this.handleRetry} icon={RefreshCw} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            Retry 3D Render
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * 3D Suspense Canvas Loading Placeholder
 */
export const ModelLoadingPlaceholder = ({ message = 'Loading 3D Medical Model...' }) => (
  <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center bg-slate-950/60 rounded-2xl text-slate-300 gap-3 border border-slate-800">
    <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
    <span className="text-xs font-medium tracking-wide text-slate-400">{message}</span>
  </div>
);

export default Model3DErrorBoundary;
