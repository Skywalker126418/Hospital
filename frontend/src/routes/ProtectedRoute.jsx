import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/Loading';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/common/Button';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Authenticating workstation credentials..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cross-role verification
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Workstation Access Restricted</h2>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          Your active staff role is <strong>{user.role?.toUpperCase()}</strong>. This portal requires authorization as <strong>{allowedRoles.join(' or ').toUpperCase()}</strong>.
        </p>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => {
              if (user.role === 'admin') window.location.href = '/admin/dashboard';
              else if (user.role === 'doctor') window.location.href = '/doctor/dashboard';
              else window.location.href = '/receptionist/dashboard';
            }}
          >
            Return to My Station
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            Switch Account
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
