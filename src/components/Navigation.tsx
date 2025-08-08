import React from 'react';
import { BarChart3, Home } from 'lucide-react';

interface NavigationProps {
  currentPage: 'home' | 'stats';
  onPageChange: (page: 'home' | 'stats') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  return (
    <nav className="bg-white rounded-2xl shadow-lg p-2 mb-8">
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange('home')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            currentPage === 'home'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Home className="h-5 w-5" />
          Dashboard
        </button>
        <button
          onClick={() => onPageChange('stats')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            currentPage === 'stats'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          Statistics
        </button>
      </div>
    </nav>
  );
};