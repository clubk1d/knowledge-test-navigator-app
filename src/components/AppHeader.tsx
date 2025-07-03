
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
    <div className="flex items-center justify-between mb-8 pt-4">
      <div className="flex items-center space-x-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Japanese Driving Test Practice</h1>
          <p className="text-gray-600">Welcome, {userEmail}!</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          onClick={() => window.open('https://www.paypal.com/paypalme/yourpaypalhandle', '_blank')}
          className="hover:bg-yellow-50 border-yellow-300 text-yellow-700"
        >
          <Coffee className="w-4 h-4 mr-2" />
          Support
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onProgressClick}
          className="hover:bg-blue-50"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Progress
        </Button>
        
        {isAdmin && (
          <Button 
            variant="outline" 
            onClick={onAdminClick}
            className="hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={onSignOut}
          className="hover:bg-red-50 hover:border-red-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AppHeader;
