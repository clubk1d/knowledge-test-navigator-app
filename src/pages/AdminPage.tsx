import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '@/components/AdminDashboard';
import AuthScreen from '@/components/AuthScreen';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { Question } from '@/types/quiz';
import { generateAllQuestions } from '@/utils/questionGenerator';

const AdminPage = () => {
  const [questions, setQuestions] = useState<Question[]>(generateAllQuestions());
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Show auth form if user is not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard 
      questions={questions}
      setQuestions={setQuestions}
      onBack={() => navigate('/')}
    />
  );
};

export default AdminPage;