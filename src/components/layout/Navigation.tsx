import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Home, FileText, BarChart3, Users, Menu, X } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  role?: 'citizen' | 'admin';
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: Home, role: 'citizen' },
  { id: 'reports', label: 'My Reports', icon: FileText, role: 'citizen' },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, role: 'admin' },
  { id: 'manage', label: 'Manage Reports', icon: Users, role: 'admin' }
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'citizen' | 'admin';
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  userRole 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = navigationItems.filter(item => 
    !item.role || item.role === userRole
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Title */}
          <h1 className="text-lg font-bold text-gray-800">Civic Portal</h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200',
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-sm">
          <div className="space-y-1 px-2 py-3">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center w-full space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
