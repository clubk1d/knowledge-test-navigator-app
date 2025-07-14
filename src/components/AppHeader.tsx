
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Coffee, BarChart3, Settings, LogOut } from 'lucide-react';

interface AppHeaderProps {
  userEmail: string;
  isAdmin: boolean;
  onProgressClick: () => void;
  onAdminClick: () => void;
  onSignOut: () => void;
}

const AppHeader = ({ userEmail, isAdmin, onProgressClick, onAdminClick, onSignOut }: AppHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pt-4 space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex-shrink-0">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Japanese Driving Test Practice</h1>
          <p className="text-sm sm:text-base text-gray-600 truncate">Welcome, {userEmail}!</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://www.paypal.com/paypalme/yourpaypalhandle', '_blank')}
          className="hover:bg-yellow-50 border-yellow-300 text-yellow-700 whitespace-nowrap"
        >
          <Coffee className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Support</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onProgressClick}
          className="hover:bg-blue-50 whitespace-nowrap"
        >
          <BarChart3 className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Progress</span>
        </Button>
        
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAdminClick}
            className="hover:bg-gray-50 whitespace-nowrap"
          >
            <Settings className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Admin</span>
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSignOut}
          className="hover:bg-red-50 hover:border-red-200 whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default AppHeader;
