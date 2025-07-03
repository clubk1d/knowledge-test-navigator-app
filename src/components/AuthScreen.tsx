
import React from 'react';
import { BookOpen } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

const AuthScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Japanese Driving Test Practice
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Master your driving knowledge with our comprehensive true/false quiz system. 
            Practice with categorized questions and track your progress.
          </p>
          
          {/* Filipino Pride */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-md mx-auto">
            <p className="text-sm font-medium text-gray-800 flex items-center justify-center space-x-2">
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
