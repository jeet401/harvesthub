import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * AuthSync component - Handles cross-tab authentication synchronization
 * Redirects users when their auth state changes in another tab
 */
export function AuthSync() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const currentPath = location.pathname;
    const currentRole = user.role;

    // Check if user is on a page that doesn't match their role
    const roleBasedRedirect = () => {
      // Admin on non-admin page
      if (currentRole === 'admin' && !currentPath.startsWith('/admin')) {
        console.warn('Admin detected on non-admin page, redirecting...');
        navigate('/admin/dashboard', { replace: true });
        return true;
      }

      // Farmer on non-farmer page
      if (currentRole === 'farmer' && !currentPath.startsWith('/farmer') && !currentPath.startsWith('/profile') && !currentPath.startsWith('/chat')) {
        console.warn('Farmer detected on non-farmer page, redirecting...');
        navigate('/farmer/dashboard', { replace: true });
        return true;
      }

      // Buyer on non-buyer page
      if (currentRole === 'buyer' && !currentPath.startsWith('/buyer') && !currentPath.startsWith('/profile') && !currentPath.startsWith('/chat')) {
        console.warn('Buyer detected on non-buyer page, redirecting...');
        navigate('/buyer/dashboard', { replace: true });
        return true;
      }

      return false;
    };

    // Redirect if on wrong page for role
    roleBasedRedirect();

  }, [user, location, navigate]);

  return null; // This component doesn't render anything
}

export default AuthSync;
