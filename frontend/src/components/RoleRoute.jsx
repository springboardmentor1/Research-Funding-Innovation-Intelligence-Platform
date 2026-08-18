import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RoleRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error('You do not have permission to access this page.');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
