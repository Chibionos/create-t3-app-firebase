import React from 'react';
import { useAuth } from '~/context/AuthContext';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
            <span className="text-white text-sm">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {user.displayName || user.email}
        </span>
      </div>
      <button
        onClick={logout}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Sign Out
      </button>
    </div>
  );
};