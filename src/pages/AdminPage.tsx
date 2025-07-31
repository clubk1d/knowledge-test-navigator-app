import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '@/components/AdminDashboard';
import SimpleAdminAuth from '@/components/SimpleAdminAuth';
import { Question } from '@/types/quiz';
import { generateAllQuestions } from '@/utils/questionGenerator';

const AdminPage = () => {
  const [questions, setQuestions] = useState<Question[]>(generateAllQuestions());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if already authenticated on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return <SimpleAdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <AdminDashboard 
      questions={questions}
      setQuestions={setQuestions}
      onBack={() => navigate('/')}
      onLogout={handleLogout}
    />
  );
};

export default AdminPage;