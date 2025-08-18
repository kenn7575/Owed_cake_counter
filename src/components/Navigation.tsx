import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Home } from 'lucide-react';

export const Navigation: React.FC = () => {
  const baseClass =
    'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200';

  return (
    <nav className="bg-white rounded-2xl shadow-lg p-2 mb-8">
      <div className="flex gap-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseClass} ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <Home className="h-5 w-5" />
          Dashboard
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            `${baseClass} ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <BarChart3 className="h-5 w-5" />
          Statistics
        </NavLink>
      </div>
    </nav>
  );
};