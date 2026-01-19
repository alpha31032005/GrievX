import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// role: 'citizen' | 'admin' | 'chief' | ['admin', 'chief']
export default function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Show nothing while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const userRole = user?.role;
  
  // Chief can access everything
  if (userRole === 'chief') return children;
  
  // Check role match
  const allowed = Array.isArray(role) ? role.includes(userRole) : role === userRole;
  if (!allowed) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }
  
  return children;
}
