import React from 'react';
import Login from '../pages/Login';

export default function ProtectedRoute({ user, children, onLoginSuccess }) {
  if (!user) {
    return <Login onLoginSuccess={onLoginSuccess} onToggleRegister={() => {}} />;
  }
  return children;
}
