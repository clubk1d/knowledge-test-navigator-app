
import React from 'react';
import { BookOpen } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

const AuthScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-6 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full mb-4 sm:mb-6">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-4 px-4">
            Japanese Driving Test Practice
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Master your driving knowledge with our comprehensive true/false quiz system. 
            Practice with categorized questions and track your progress.
          </p>
          
          {/* Filipino Pride */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto">
            <p className="text-xs sm:text-sm font-medium text-gray-800 flex items-center justify-center space-x-2">
              <span>🇵🇭</span>
              <span>Proudly made by a Filipino</span>
              <span>🇵🇭</span>
            </p>
          </div>
        </div>

        <AuthForm />
      </div>
    </div>
  );
};

export default AuthScreen;
